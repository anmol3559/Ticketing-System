function validateCreateTicket(req, res, next) {
    const { category, issue, priority } = req.body;
    const err = [];

    if (!category || category.trim().length === 0) {
        err.push("Category is required");
    }

    if (!issue || issue.trim().length < 3) {
        err.push("Issue description must be at least 3 characters long");
    }

    const validatorPriority = Object.values(Ticket_priority);

    if (!priority || !validatorPriority.includes(priority)) {
        err.push(`Priority must be one of defined values: ${validatorPriority.join(", ")}`);
    }

    if (err.length > 0) {
        return res.status(400).json({ message: err[0], err });
        req.body.category = category.trim();
        req.body.issue = issue.trim();
        next();
    }
}

function validateStatusUpdate(req, res, next) {
    const { status } = req.body;
    const validStatuses = Object.values(Ticket_status);

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: `status must be one of them: ${validStatuses.join(", ")}` });
    }
}

