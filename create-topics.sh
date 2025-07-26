#!/bin/bash

create_topic() {
  echo "Tentando criar o tópico: $1"
  /opt/bitnami/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9092 \
    --create --if-not-exists \
    --topic "$1" \
    --partitions 1 \
    --replication-factor 1
  if [ $? -eq 0 ]; then
    echo "Tópico $1 criado com sucesso."
  else
    echo "Falha ao criar o tópico $1."
  fi
}

echo "⏳ Aguardando Kafka..."
sleep 15

# Criar os tópicos
create_topic checkout.created
create_topic payment.approved
create_topic payment.rejected
create_topic shipping.completed

echo "✅ Tópicos criados ou já existentes."
