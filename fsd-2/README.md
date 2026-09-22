# EventAura - College Event Management System

EventAura is a full-stack MERN web application that connects students and colleges through event-based communities. Each college has its own community managed by an admin, while students can join any community to explore, chat, register, and participate in events.

## 🚀 Features

### For Students:
- Join multiple college communities
- Register for events across different colleges
- View event history, certificates, and badges
- Raise queries for event-related issues
- Participate in community discussions
- Track achievements and leaderboard ranking

### For Admins:
- Create and manage college communities
- Create, edit, and delete events
- Manage event registrations and participants
- Respond to student queries
- Upload and manage certificates

## 💻 Tech Stack

- **Frontend**: React + TypeScript + CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT with role-based access control
- **API**: RESTful API design

## 🏗️ Project Structure

```
fsd-2/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Community.js
│   │   ├── Event.js
│   │   └── Query.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── communities.js
│   │   ├── events.js
│   │   ├── queries.js
│   │   └── users.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── pages/
    │   │   ├── Landing.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── AdminDashboard.tsx
    │   │   ├── StudentHome.tsx
    │   │   └── Unauthorized.tsx
    │   ├── utils/
    │   │   └── auth.ts
    │   ├── config.js
    │   └── App.tsx
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are already configured in `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://23501a05c6_db_user:revanth1945@cluster0.jbg176n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=5zMwij9O1sss+mN+Iq8GjPkNCX6ebxSrA8ZfCJ1HBG4=
   ADMIN_SECRET=EVENTAURA_ADMIN_2024
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React app:
   ```bash
   npm start
   ```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with role selection
- `POST /api/auth/login` - User login

### Communities
- `GET /api/communities` - Get all communities
- `POST /api/communities/:id/join` - Join a community
- `GET /api/communities/:id` - Get community details

### Events
- `GET /api/events` - Get all events (with search/filter)
- `POST /api/events` - Create event (Admin only)
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id` - Delete event (Admin only)

### Queries
- `POST /api/queries` - Create query
- `GET /api/queries/community/:id` - Get community queries
- `PUT /api/queries/:id/respond` - Respond to query (Admin only)

### Users
- `GET /api/users/profile` - Get user profile with events
- `GET /api/users/leaderboard` - Get leaderboard

## 👥 User Roles

### Admin
- **Registration**: Requires admin secret code (`EVENTAURA_ADMIN_2024`)
- **Permissions**: 
  - Create/manage events for their college
  - Respond to student queries
  - View participant lists
  - Manage community settings

### Student
- **Registration**: Simple registration process
- **Permissions**:
  - Join multiple communities
  - Register for events
  - Raise queries
  - View personal achievements

## 🎯 Key Features Implemented

✅ **Authentication System**
- JWT-based authentication
- Role-based access control
- Admin secret code validation

✅ **Community Management**
- Auto-creation of communities for admins
- Join/leave community functionality
- Cross-college interaction

✅ **Event Management**
- CRUD operations for events
- Event registration system
- Theme-based categorization
- Registration deadline enforcement

✅ **Query System**
- Student query submission
- Admin response system
- Query status tracking

✅ **User Profiles**
- Event participation tracking
- Certificate management
- Badge system foundation
- Activity timeline

✅ **Search & Discovery**
- Event search by theme/name
- Community browsing
- Featured events display

## 🚀 Usage

1. **Visit the Application**: `http://localhost:3000`

2. **Register as Admin**:
   - Select "Admin" role
   - Enter college name
   - Use admin secret: `EVENTAURA_ADMIN_2024`

3. **Register as Student**:
   - Select "Student" role
   - Complete registration

4. **Admin Workflow**:
   - Login → Dashboard → Create Events → Manage Queries

5. **Student Workflow**:
   - Login → Browse Communities → Join → Register for Events

## 🔮 Future Enhancements

- Real-time chat system
- Certificate upload/download
- Advanced badge system
- Event analytics dashboard
- Mobile responsive design
- Push notifications
- Payment integration for paid events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**EventAura** - Connecting colleges, empowering students, creating experiences! 🎓✨