"""full-text index to products

Revision ID: a1b9fc55f20d
Revises: 159aef5c2313
Create Date: 2025-04-28 16:56:27.934381

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import TSVECTOR

# revision identifiers, used by Alembic.
revision: str = 'a1b9fc55f20d'
down_revision: Union[str, None] = '159aef5c2313'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1) заполняем колонку существующими данными
    op.execute("""
      UPDATE products
      SET search_vector = to_tsvector(
        'russian',
        coalesce(name,'') || ' ' || coalesce(key_word,'')
      );
    """)

    # 2) создаём GIN-индекс на search_vector
    op.create_index(
        'ix_products_search_vector',
        'products',
        ['search_vector'],
        postgresql_using='gin'
    )

    # 3) регистрируем (или обновляем) функцию-триггер
    op.execute("""
    CREATE OR REPLACE FUNCTION products_search_vector_update()
    RETURNS trigger AS $$
    BEGIN
      NEW.search_vector := to_tsvector(
        'russian',
        coalesce(NEW.name,'') || ' ' || coalesce(NEW.key_word,'')
      );
      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;
    """)

    # 4) удаляем старый триггер, если он есть
    op.execute("DROP TRIGGER IF EXISTS trg_products_search_vector ON products;")

    # 5) создаём триггер заново
    op.execute("""
    CREATE TRIGGER trg_products_search_vector
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();
    """)


def downgrade() -> None:
    # откат: сначала индекс, потом триггер, функцию и колонку
    op.drop_index('ix_products_search_vector', table_name='products')
    op.execute("DROP TRIGGER IF EXISTS trg_products_search_vector ON products;")
    op.execute("DROP FUNCTION IF EXISTS products_search_vector_update();")
