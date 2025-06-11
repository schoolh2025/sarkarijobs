# SarkariJobs Backend Server

This is the backend server for the SarkariJobs website, providing APIs for jobs, results, admissions, and user management.

## Features

- RESTful APIs for jobs, results, and admissions
- User authentication and authorization
- Admin dashboard for content management
- Email notifications system
- RSS feed integration for auto-updates
- MongoDB database integration
- TypeScript support
- Jest testing setup

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sarkarijobs.git
cd sarkarijobs/server
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and configure your environment variables:
```env
# Copy from .env.example and modify as needed
cp .env.example .env
```

4. Build the TypeScript code:
```bash
npm run build
# or
yarn build
```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The server will start on `http://localhost:5000` by default.

## Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

## API Documentation

### Authentication

- POST `/api/auth/register` - Register a new admin user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user profile
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password

### Jobs

- GET `/api/jobs` - List all jobs
- GET `/api/jobs/:id` - Get job by ID
- POST `/api/jobs` - Create new job (protected)
- PATCH `/api/jobs/:id` - Update job (protected)
- DELETE `/api/jobs/:id` - Delete job (protected)

### Results

- GET `/api/results` - List all results
- GET `/api/results/:id` - Get result by ID
- POST `/api/results` - Create new result (protected)
- PATCH `/api/results/:id` - Update result (protected)
- DELETE `/api/results/:id` - Delete result (protected)

### Admissions

- GET `/api/admissions` - List all admissions
- GET `/api/admissions/:id` - Get admission by ID
- POST `/api/admissions` - Create new admission (protected)
- PATCH `/api/admissions/:id` - Update admission (protected)
- DELETE `/api/admissions/:id` - Delete admission (protected)

### Subscriptions

- POST `/api/subscriptions/subscribe` - Subscribe to notifications
- GET `/api/subscriptions/verify/:token` - Verify subscription
- GET `/api/subscriptions/unsubscribe/:token` - Unsubscribe
- PATCH `/api/subscriptions/preferences` - Update preferences

## Deployment

1. Build the production version:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm start
# or
yarn start
```

### Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure environment variables
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `SMTP_*` - Email configuration
- `FRONTEND_URL` - Frontend application URL
- `RSS_FEEDS` - Comma-separated RSS feed URLs

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@sarkarijobs.schoolhunt.in or create an issue in the repository.