from locust import HttpUser, task, between
import os
import random

API_PREFIX = "/api"                       # общий префикс всех эндпоинтов


class MiniAppUser(HttpUser):
    wait_time = between(1, 3)
    host = os.getenv("LOCUST_HOST", "http://backend:8080")  # без /api в конце


    # ------------------------------------------------------------------ #
    #  Авторизация + обязательный каталог                                 #
    # ------------------------------------------------------------------ #
    def on_start(self) -> None:
        """
        1. Достаёт JWT (STATIC_JWT из ENV или через /auth/telegram).
        2. Получает каталог товаров и id текущего пользователя.
           Если каталог пустой или /products недоступен — тест сразу останавливается.
        """
        token = os.getenv("STATIC_JWT")

        if not token:
            init_data = os.environ["TG_INIT_DATA"]
            with self.client.post(
                API_PREFIX + "/auth/telegram",
                json={"initData": init_data},
                name="POST /auth/telegram",
                catch_response=True,
            ) as resp:
                if resp.status_code != 200 or "access_token" not in resp.json():
                    resp.failure("Auth failed, cannot start test")
                    self.environment.runner.quit()
                    raise RuntimeError("Auth failed")
                token = resp.json()["access_token"]

        self.client.headers.update({"Authorization": f"Bearer {token}"})

        # --- каталог ---
        with self.client.get(API_PREFIX + "/products", name="BOOT /products", catch_response=True) as resp:
            if resp.status_code != 200:
                resp.failure(f"Catalog unavailable ({resp.status_code})")
                self.environment.runner.quit()
                raise RuntimeError("Catalog unavailable")

            self.products = resp.json()
            if not self.products:
                self.environment.runner.quit()
                raise RuntimeError("Catalog is empty – seed data missing")

        # --- id пользователя ---
        with self.client.get(API_PREFIX + "/users/me", name="BOOT /users/me", catch_response=True) as me_resp:
            if me_resp.status_code != 200:
                me_resp.failure("Cannot fetch /users/me")
                self.environment.runner.quit()
                raise RuntimeError("Cannot fetch user profile")
            self.user_id = me_resp.json()["id"]

    # ------------------------------------------------------------------ #
    #  Нагрузочные задачи                                                 #
    # ------------------------------------------------------------------ #
    @task(3)
    def catalog(self):
        self.client.get(API_PREFIX + "/products", name="GET /products")

    @task(1)
    def product_page(self):
        product = random.choice(self.products)
        self.client.get(
            f"{API_PREFIX}/products/{product['id']}",
            name="GET /products/{id}",
        )

    @task(2)
    def create_order(self):
        product = random.choice(self.products)
        form = {
            "user_id": self.user_id,
            "product_id": product["id"],
            "seller_id": product["seller_id"],
        }
        self.client.post(
            API_PREFIX + "/orders",
            data=form,                       # x-www-form-urlencoded
            name="POST /orders",
        )

    @task(1)
    def my_orders(self):
        self.client.get(API_PREFIX + "/users/orders", name="GET /users/orders")
