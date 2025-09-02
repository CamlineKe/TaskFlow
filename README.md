# TaskFlow 📋✨

> A modern, full-stack task management application built with Next.js and Node.js

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://mui.com/)

## 🚀 Overview

TaskFlow is a comprehensive project management application that helps teams organize, track, and complete tasks efficiently. With an intuitive dashboard, real-time collaboration features, and a beautiful Material-UI interface, TaskFlow makes project management seamless and enjoyable.

### ✨ Key Features

- **🎯 Intuitive Dashboard** - Get a bird's eye view of all projects and tasks
- **👥 Team Collaboration** - Work together with real-time updates and shared spaces
- **⚡ Lightning Fast** - Built with modern tech stack for instant responsiveness
- **🔒 Secure & Private** - Enterprise-grade security with JWT authentication
- **📱 Mobile First** - Optimized for mobile devices and responsive design
- **🎨 Smart Organization** - Drag-and-drop task management with Kanban boards

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand + React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Styling**: CSS-in-JS with MUI's emotion
- **Theme**: Dark/Light mode support with next-themes

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **Validation**: Zod schemas
- **Email**: Nodemailer with Gmail/Ethereal
- **Security**: Helmet, bcryptjs, CORS
- **File Upload**: Multer with Cloudinary

### Development Tools
- **Build Tool**: Next.js built-in bundler
- **Dev Server**: Nodemon for backend hot-reload
- **Testing**: Jest with Supertest
- **Code Quality**: ESLint, TypeScript strict mode
- **API Client**: Axios with interceptors

## 🏗️ Project Structure

```
TaskFlow/
├── client/                 # Next.js frontend application
│   ├── app/               # App router directory
│   │   ├── (auth)/        # Authentication routes (login, register)
│   │   ├── app/           # Protected dashboard routes
│   │   │   ├── projects/  # Project management pages
│   │   │   ├── tasks/     # Task management pages
│   │   │   └── settings/  # User settings
│   │   └── page.tsx       # Landing page
│   ├── components/        # Reusable React components
│   │   ├── board/         # Kanban board components
│   │   ├── projects/      # Project-related components
│   │   ├── tasks/         # Task-related components
│   │   ├── ui/           # Generic UI components
│   │   └── providers/     # Context providers
│   ├── lib/              # Utility libraries and configurations
│   ├── store/            # Zustand state management
│   └── context/          # React contexts
├── server/                # Node.js backend application
│   └── src/
│       ├── api/          # API routes and controllers
│       │   ├── auth/     # Authentication endpoints
│       │   ├── projects/ # Project management API
│       │   ├── tasks/    # Task management API
│       │   ├── users/    # User management API
│       │   └── columns/  # Board column API
│       ├── models/       # MongoDB/Mongoose models
│       ├── middleware/   # Express middleware
│       ├── utils/        # Utility functions
│       └── config/       # Configuration files
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CamlineKe/TaskFlow.git
   cd TaskFlow
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**

   **Backend (.env)**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/taskflow
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

   **Frontend (.env.local)**
   ```bash
   cd ../client
   touch .env.local
   ```
   
   Add the following:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_SKIP_NPM_CHECK=1
   NEXT_TELEMETRY_DISABLED=1
   ```

4. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎮 Usage

### User Authentication
- **Register**: Create a new account with email verification
- **Login**: Secure JWT-based authentication
- **Password Reset**: Email-based password recovery

### Project Management
- **Create Projects**: Set up new projects with descriptions and due dates
- **Project Dashboard**: View project progress, tasks, and team members
- **Project Settings**: Edit project details and manage team access

### Task Management
- **Kanban Board**: Drag-and-drop tasks between columns (To Do, In Progress, Done)
- **Task Creation**: Add tasks with titles, descriptions, priorities, and due dates
- **Task Assignment**: Assign tasks to team members
- **Task Tracking**: Monitor task completion and progress

### Dashboard Features
- **Overview**: Quick stats on all projects and tasks
- **Recent Activity**: Latest task updates and completions
- **Progress Tracking**: Visual progress indicators for projects

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/initiate-registration` - Start email verification
- `POST /api/auth/verify-registration-email` - Verify email code
- `POST /api/auth/complete-registration` - Complete registration

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/board` - Get project Kanban board

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

## 🏃‍♂️ Running in Production

### Backend Build
```bash
cd server
npm run build
npm start
```

### Frontend Build
```bash
cd client
npm run build
npm start
```

### Environment Variables
- Set `NODE_ENV=production`
- Update `CLIENT_URL` and `NEXT_PUBLIC_API_URL` to production URLs
- Use secure, random JWT_SECRET
- Configure production MongoDB connection

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Real-time notifications
- [ ] File attachments for tasks
- [ ] Time tracking functionality
- [ ] Advanced reporting and analytics
- [ ] Integration with third-party tools
- [ ] Mobile app development
- [ ] Offline support

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Camline** - [CamlineKe](https://github.com/CamlineKe)

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Next.js team for the fantastic React framework
- MongoDB team for the powerful database solution
- All the open-source contributors who made this project possible

---

**Built with ❤️ for better project management**