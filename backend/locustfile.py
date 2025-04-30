# locustfile.py

from locust import HttpUser, task, between, SequentialTaskSet

# Общие задачи покупателя
class BuyerBehavior(SequentialTaskSet):
    wait_time = between(1, 3)

    @task
    def view_catalog(self):
        self.client.get("/products", name="GET /products")

    @task
    def view_product(self):
        self.client.get(
            "/products/fb4b1641-8cc9-44fa-a604-3f5cedd4b720",
            name="GET /products/[product_id]"
        )

    @task
    def view_order_history(self):
        self.client.get("/users/orders", name="GET /orders")


# Общие задачи продавца и модератора
class SellerBehavior(SequentialTaskSet):
    wait_time = between(2, 5)

    @task
    def list_my_products(self):
        self.client.get("/products/seller", name="GET /users/products")

    @task
    def update_price(self):
        self.client.patch(
            "/products/fb4b1641-8cc9-44fa-a604-3f5cedd4b720",
            json={"price": 100},
            name="PATCH /products/[product_id]"
        )

    # Общие задачи продавца и модератора
class ModeratorBehavior(SequentialTaskSet):
    wait_time = between(2, 5)

    @task
    def list_reviews(self):
        self.client.get("/reviews", name="GET /reviews")

    @task
    def view_review(self):
        self.client.get(
            "/reviews/15f86426-98c7-41d1-a663-7ea890e2b0cb",
            name="GET /reviews/[review_id]"
        )

    @task
    def submit_review(self):
        self.client.post(
            "/reviews",
            json={
                "user_id": "57026a31-ae59-4263-a620-57193f2a0bd5",
                "product_id": "fb4b1641-8cc9-44fa-a604-3f5cedd4b720",
                "rating": 5,
                "comment": "Отличный товар!"
            },
            name="POST /reviews"
        )


# Базовый класс, который ставит заголовки в on_start
class BaseUser(HttpUser):
    # Тут перечисляем все кастомные заголовки
    custom_headers = {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNWQ5NGY3ZS1hMDQ3LTQwM2QtYWY5Yi03ZWM5MTI4NTRhYmQiLCJleHAiOjE3NDU5NDA2NTQsImlzcyI6IndiLWJhY2siLCJhdWQiOiJ3Yi1mcm9udCJ9.k7rQVWg8_lCwIwh41TeNKZAAzL2i63nEmfubCF4efuU",
    }

    def on_start(self):
        # авто-добавляем их ко всем будущим запросам
        self.client.headers.update(self.custom_headers)
        self.client.verify = False


class BuyerUser(BaseUser):
    tasks = [BuyerBehavior]
    weight = 8
    wait_time = between(1, 2)


class SellerUser(BaseUser):
    tasks = [SellerBehavior]
    weight = 2
    wait_time = between(5, 10)


class ModeratorUser(BaseUser):
    tasks = [ModeratorBehavior]
    weight = 2
    wait_time = between(5, 10)


# locust --users 300 --spawn-rate 30 --host=https://cashbackwb.ru/api
