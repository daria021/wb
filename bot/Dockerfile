FROM python:3.12

RUN apt-get update

WORKDIR /wb

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .