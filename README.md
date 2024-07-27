# Exercise 1 Response

Can be found in the exercise1 folder. Please refer to exercise1/readme.docx
file for the response.

Diagrams produced can be found in the exercise1/diagrams folder.


# Exercise 2 Response

## Task 1

Task 1 response can be found in exercise2/design folder.

Please refer to exercise2/design/openapi.yml for swagger/openapi documentation
of the API design. Can also view exercise2/design/openapi.html (shows the same
content in more readable format).

Please note that this design document has been automatically generated from the
mock code in Task 2. swagger-ui can be accessed at http://<task 2 url>/api-docs

## Task 2

Task 2 is done with node.js/typescript.

For task 2, I tried to take an approach where Task 1 requirements could be
fulfilled from Task2 prototype.  This was achieved with the fastify web
framework and fastify-swagger plugin.

I've used zod for defining request and response types. Same types
have been used for request/response validation and documentation generation.

### Running the project

To run the project, please make sure you have node.js and npm installed.
This should work in all platforms.

To run natively:

    cd exercise2
    npm install
    npm start

To run with docker:

    cd exercise2
    docker build -t order-management-harness .
    docker run -p 8080:8080 order-management-harness .


Once running, please go to http://localhost:8080/api-docs to access the swagger interface.

### Configure the project

By default, the project runs on port 8080 with basic authentication disabled.
If you want to configure those, please copy the .env.sample file to .env and modify the values. Re-running the project after that will update setting.

Can modify dummy data that comes with the project in the exercise2/src/orders/dummy-data.ts file.

Can also inject new orders by POSTing to the /api/v0/orders endpoint.

API stores data in memory and does not persist data between restarts.
