# Backend
This is the backend part of the project. The UI part done in Angular 8 can be found here: https://github.com/Peijooni/angularNGXS The UI done in React can be found here: xxxxxxx

## Used technologies and included packages in backend
* nodeJS
* Express
* Morgan
* http-errors
* cors

## Functionaity
Backend implements REST API in the following URLs:
* GET: /practises
* GET: /practises/id
* POST: /practises
* PUT: /practises/id
* DELETE: /practises/id

POST operation takes in JSON object with parameters: title, description and date. Date is in form: YYYY-MM-DD. Time is not used.

Backend is protected with OAuth token. Session is created based on the token and if it is valid, no checks are made to the OAuth provider. Token is send as a parameter ?token=[token] to the server. Server uses https-protocol.