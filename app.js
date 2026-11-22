const dotenv = require('dotenv').config();
const express = require('express');
const errorHandler = require('./middleware/errorHandler'); //error handler
const logRequest = require('./middleware/logger'); //log request
const { validateTodo, validatePatch } = require('./middleware/validator');
const Todo = require('./models/todo.model'); //mongoose model
const connectDB = require('./database/db'); //connect to database
const cors = require('cors'); //cors
const app = express();

connectDB(); //connect to database
app.use(express.json());
app.use(cors('*'));
app.use(logRequest);



// GET All
app.get('/todos', async(req, res) => {
  const todos = await Todo.find();
  res.status(200).json(todos);
});

// POST New
app.post('/todos', validateTodo, async (req, res) => {
  const { task, completed } = req.body;
  const newTodo = new Todo({
    task,
    completed,
  });
  
  try{
    await newTodo.save();

  res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.get('/todos', async (req, res) => {
  const todos = await Todo.find({});
  res.status(200).json(todos);
});
app.get('/todos/completed', async (req, res) => {
  const todos = await Todo.find({ completed: true });
  res.status(200).json(todos);
});
// GET One
app.get('/todos/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Not found' });
  res.status(200).json(todo);
});

// PATCH Update
app.patch('/todos/:id', validatePatch, async (req, res) => {
 try {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!todo) return res.status(404).json({ error: 'Not found' });
  res.status(200).json(todo);
}
  catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE
app.delete('/todos/:id', async (req, res) => {
  try {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Not found' });
  res.status(200).json({ message: 'Todo deleted' });
}
  catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.use(errorHandler);

const PORT = process.env.port || 3000;
app.listen(PORT, () => console.log(`Todo API on port ${PORT}`));
