# UPPAEDT - API REST

This project is a REST API for managing university planning data. It provides endpoints to retrieve and synchronize formation and course data.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Docker](#docker)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/TuroYT/uppaedt-api-nodejs.git
    cd uppa-edt-api
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file based on the `.env.example`:
    ```sh
    cp .env.example .env
    ```

4. Fill in the environment variables in the `.env` file.

5. Build the project:
    ```sh
    npm run build
    ```

## Usage

Start the server:
```sh
npm run start
```

## API Endpoints

The API provides the following endpoints:

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://god.gw.postman.com/run-collection/39304512-01bcea13-bc2b-4313-8c6b-f2c44f851f21?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D39304512-01bcea13-bc2b-4313-8c6b-f2c44f851f21%26entityType%3Dcollection%26workspaceId%3Dbf2f2386-6fde-45d4-9655-7a3979abc5de)
## Environment Variables

The following environment variables are required:

- `DB_HOST`: The database host.
- `DB_USER`: The database user.
- `DB_PASS`: The database password.
- `DB_NAME`: The database name.

## Docker

To run the project using Docker:

1. Build the Docker image:
    ```sh
    docker build -t uppaedt-api .
    ```

2. Run the Docker container:
    ```sh
    docker run -d -p 3000:3000 --env-file .env uppaedt-api
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.