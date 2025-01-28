# Link2Resume

Link2Resume is a web-based application designed to streamline the process of creating and managing professional resumes. It allows users to log in using LinkedIn, automatically retrieve profile details, and customize their resumes with additional information such as skills, education, projects, and experience.

## Features

- **LinkedIn Integration**: Login using LinkedIn and fetch profile information.
- **Resume Builder**: Create, update, and view resumes seamlessly.
- **Customization**: Add skills, education, projects, and work experience.
- **Dynamic Preview**: View real-time changes to your resume.
- **Secure Storage**: Data is securely stored using MongoDB.

## Technologies Used

- **Frontend**: React, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: LinkedIn OAuth 2.0
- **Environment Variables**: Configured using `.env` files

## Prerequisites

Ensure you have the following installed:

- Node.js (v14+)
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MdShayemurRahman/resumeGen-backend.git backend
   git clone https://github.com/MdShayemurRahman/resumeGen-frontend.git frontend
   ```

2. Install dependencies:
   ```bash
   cd ./frontend
   npm install
   cd ../backend
   npm install
   ```

3. Create a `.env` file in the backend root directory and configure the following variables:
   ```env
   PORT=8080
   DB_URL=<your_mongo_db_url>
   SESSION_SECRET=<your_session_secret>
   LINKEDIN_CLIENT_ID=<your_linkedin_client_id>
   LINKEDIN_CLIENT_SECRET=<your_linkedin_client_secret>
   LINKEDIN_CALLBACK_URL=http://localhost:8080/auth/linkedin/callback
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```bash
   npm run server
   ```

5. Start the frontend (if applicable):
   ```bash
   cd ../frontend
   npm start
   ```

## API Endpoints

### Authentication

- **GET /auth/linkedin**: Redirects to LinkedIn for authentication.
- **GET /auth/linkedin/callback**: Handles the LinkedIn callback and user authentication.

### Resume Management

- **POST /cv**: Create or update a resume.
- **GET /cv/:userId**: Retrieve a resume by user ID.
- **PATCH /cv/:userId**: Update specific fields in a resume.
- **DELETE /cv/:userId**: Delete a resume by user ID.

## Usage

1. **Login via LinkedIn**:
   - Users authenticate with LinkedIn to retrieve their profile details.
   - On successful login, they are redirected to their profile page.

2. **Create/Update Resume**:
   - Add additional information like skills, education, projects, and experience.

3. **Preview Resume**:
   - View a dynamic preview of the resume in the application.

4. **Manage Data**:
   - Use the provided APIs for CRUD operations on resume data.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature/bug fix.
3. Commit your changes and push them to your fork.
4. Open a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

Feel free to read my [Thesis Documentation](https://urn.fi/URN:NBN:fi:amk-2024061022475) about creating dynamic resume with Linkedin Integration.
