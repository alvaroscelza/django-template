# <<Project Name>>
<<Project description.>>

## Technology Stack
- Python 3.13
- Django 5
- PostgreSQL 17

## Installation and running
- Create a virtual environment and activate it. Example: `virtualenv venv`
- Enter environment: Example: `.venv\Scripts\activate`
- Install requirements: `pip install -r requirements.dev.txt`
- Create `.env` file at project root. File .env-example is provided as a guide of this file's content.
- Make migrations: `python manage.py makemigrations`
- Apply migrations: `python manage.py migrate`
- In production, collect static files: `python manage.py collectstatic`
- Run using `python main.py runserver`

## Development
For development with hot reloading:
1. **Start Django backend:**
   ```bash
   python production_main.py runserver
   ```
2. **Start webpack dev server (in a separate terminal):**
   ```bash
   npm start
   ```
3. **Access the application:**
    - **Development (with hot reload):** `http://localhost:3000/`
    - **Development (without hot reload):** `http://localhost:8000/`

      You don't need to run webpack dev server, but each time you change anything in the React files you need to rebuild
      the frontend manually with `npm run build` and then reload django server.

### How it works:
- **Webpack dev server** watches your React files in `src/` and rebuilds automatically
- **Hot reloading** updates the browser without full page refresh
- **API calls** are proxied from `localhost:3000` to `localhost:8000`
- **Static files** (CSS, images) are served from the `static/` directory

## Testing
- Run the tests with `pytest`
- Get test coverage with:
    - `coverage run --source='.' -m pytest`
    - `coverage report --skip-covered --show-missing`

## Using Swagger for API documentation
- Run project
- Go to `<project URL>/api/<API version>/swagger/`, example: `http://127.0.0.1:8000/api/v1/swagger/` for localhost
- There you can see all endpoints. To use them you have to get the JWT token using the SESSIONS endpoint:
    - Search in Swagger for the `POST /sessions/` endpoint.
    - Use it. You need to provide with a valid `username` and `password` credentials pair.
    - You will receive two tokens: one for `refresh`, the other for `access`. Copy the `access` token in the clipboard.
    - Scroll all up in the Swagger page, find the button called `Authorize`, it has a lock image attached to it. Click
      it.
    - You will see a modal small window with the information of the type of authorization that is going to be used, in
      this case JWT.
    - You will also see a lonely input with the `Value:` label. In this input you have to
      insert `Bearer <access token copied in the clipboard>`.
      Example with fake token: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1N` (bear in mind that the real token tends to be
      far longer that this).
    - Click `Authorize` and now all endpoints should start working.
    - Have fun.
