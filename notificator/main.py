import asyncio
import logging

from dependencies.services.consumer import get_consumer
from dependencies.services.notification import get_notificator

logger = logging.getLogger(__name__)


async def main():
    logger.info("Initializing service...")

    consumer = get_consumer()
    notificator = get_notificator()

    logger.info("Service initialized, starting...")

    try:
        await consumer.execute(notificator)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error("Unexpected exception", exc_info=True)
    finally:
        logger.info("Service has been successfully shut down")


if __name__ == '__main__':
    asyncio.run(main())
