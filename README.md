# App Treino

Estrutura inicial de uma aplicação Java 21 com Spring Boot e Maven.

## Pré-requisitos

- Java 21
- Maven 3.9 ou superior

## Executar a aplicação

Na raiz do projeto, execute:

```bash
mvn spring-boot:run
```

## Gerar o pacote

```bash
mvn clean package
```

O arquivo executável será criado no diretório `target/`. Para executá-lo:

```bash
java -jar target/app-treino-0.0.1-SNAPSHOT.jar
```

## Estrutura principal

```text
src/
└── main/
    ├── java/com/apptreino/
    │   └── AppTreinoApplication.java
    └── resources/
        └── application.properties
```
