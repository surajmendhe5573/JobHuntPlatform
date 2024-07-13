const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a job posting
router.post('/jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).send({ error: 'Only employers can post jobs' });
    }
    const job = new Job({ ...req.body, postedBy: req.user._id });
    await job.save();
    res.status(201).send(job);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Search jobs
router.get('/jobs/search', async (req, res) => {
  try {
    const { title, location, category } = req.query;
    const query = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const jobs = await Job.find(query);
    res.send(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Get all job listings
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.send(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send({ error: 'Job not found' });
    }
    res.send(job);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Update a job posting
router.patch('/jobs/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'location', 'requirements'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates' });
    }

    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) {
      return res.status(404).send({ error: 'Job not found' });
    }

    updates.forEach(update => job[update] = req.body[update]);
    await job.save();
    res.send(job);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Delete a job posting
router.delete('/jobs/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    if (!job) {
      return res.status(404).send({ error: 'Job not found' });
    }
    res.send(job);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Apply for a job
router.post('/jobs/:id/apply', auth, async (req, res) => {    // job id
  try {
    if (req.user.role !== 'job_seeker') {
      return res.status(403).send({ error: 'Only job seekers can apply for jobs' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send({ error: 'Job not found' });
    }

    job.applications.push(req.user._id);
    await job.save();
    res.send({message: 'Job Applied successfully', job});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// View job applications
router.get('/jobs/:id/applications', auth, async (req, res) => {    // job id
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).send({ error: 'Only employers can view applications' });
    }

    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id }).populate('applications');
    if (!job) {
      return res.status(404).send({ error: 'Job not found' });
    }
console.log(job.applications);
    res.send(job.applications);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});


module.exports = router;
