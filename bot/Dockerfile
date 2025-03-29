FROM python:3.12

ENV developer=ilia

RUN apt-get update

WORKDIR /wb

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .