-- Database Setup Script for Ticketing System (SQL Server)

-- 1. Create the User table
-- This matches the requirements from authController.js
CREATE TABLE [User] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) DEFAULT 'user', -- Examples: 'user', 'agent', 'admin'
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    last_login DATETIME NULL
);
GO

-- 2. Create the Ticket table
-- For users to create and track support requests
CREATE TABLE Ticket (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES [User](id),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(50) DEFAULT 'open', -- Examples: 'open', 'in_progress', 'resolved', 'closed'
    priority NVARCHAR(50) DEFAULT 'low', -- Examples: 'low', 'medium', 'high', 'urgent'
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- 3. Create the TicketMessage table
-- For conversation/comments on a specific ticket between users and agents
CREATE TABLE TicketMessage (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ticket_id INT NOT NULL FOREIGN KEY REFERENCES Ticket(id) ON DELETE CASCADE,
    user_id INT NOT NULL FOREIGN KEY REFERENCES [User](id),
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 4. Optional: Insert a default admin user
-- The password should be hashed with bcrypt in a real scenario.
-- Example: 'admin123' hashed with bcrypt:
-- INSERT INTO [User] (name, email, password, role) 
-- VALUES ('Admin User', 'admin@example.com', '$2b$10$YourHashedPasswordHere', 'admin');
-- GO
