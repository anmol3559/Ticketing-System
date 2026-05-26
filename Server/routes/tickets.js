const express = require("express");
const router = express.Router();
const { validCreateTicket } = require("../validators/ticketvalidators");
const { authMiddleware } = require("../middleware/auth");
const { createTicket, getAllUserTickets, getTicketById, updateTicket, deleteTicket } = require("../controller/ticketController");

router.post("/create", authMiddleware, validCreateTicket, createTicket);
