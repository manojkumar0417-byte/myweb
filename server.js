const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'surprise.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// GET surprise data
app.get('/api/surprise', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading surprise data:', err);
      return res.status(500).json({ error: 'Failed to read surprise data' });
    }
    try {
      const json = JSON.parse(data);
      res.json(json);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON data' });
    }
  });
});

// POST update surprise data
app.post('/api/surprise', (req, res) => {
  const updatedData = req.body;
  if (!updatedData || typeof updatedData !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error saving surprise data:', err);
      return res.status(500).json({ error: 'Failed to save surprise data' });
    }
    res.json({ success: true, message: 'Surprise updated successfully!', data: updatedData });
  });
});

// POST reset to defaults
app.post('/api/reset', (req, res) => {
  const defaultData = {
    recipientName: "[NAME]",
    landingTitle: "I have a little surprise for you… 🎁",
    landingButtonText: "Open Your Surprise ❤️",
    countdownMessages: [
      "Preparing something special...",
      "Counting down to magic...",
      "Get ready for a heartwarming journey..."
    ],
    mainGreeting: "Happy Birthday, [NAME] 🎂❤️",
    emotionalMessage: "On this extraordinarily beautiful day, I want to remind you how deeply special you are to me. You bring warmth into my world, light up my darkest nights, and turn everyday moments into precious memories. May your birthday be as glowing, magical, and unforgettable as your smile. I love you to the moon and back! ✨💖",
    audio: {
      title: "Romantic Birthday Melody 🎵",
      "customUrl": "",
      autoplay: true
    },
    gallery: [
      {
        id: 1,
        title: "[PHOTO 1]",
        caption: "Your radiant smile that melts my heart ✨",
        imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop",
        date: "First Favorite Photo"
      },
      {
        id: 2,
        title: "[PHOTO 2]",
        caption: "A sweet moment we will cherish forever 🌹",
        imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop",
        date: "Unforgettable Memories"
      },
      {
        id: 3,
        title: "[PHOTO 3]",
        caption: "Under the starry night sky with you 🌙",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        date: "Magical Evening"
      },
      {
        id: 4,
        title: "[PHOTO 4]",
        caption: "Laughter, warmth and endless love ❤️",
        imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop",
        date: "Pure Joy"
      }
    ],
    memories: [
      {
        id: 1,
        date: "The Beginning",
        title: "[MEMORY 1]: The Day We First Met 💫",
        description: "The universe brought us together, and from that very second, everything became brighter and full of hope.",
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 2,
        date: "Special Chapter",
        title: "[MEMORY 2]: Our First Stargazing Trip ✨",
        description: "We talked for hours under the open night sky, sharing secrets, dreams, and endless giggles.",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 3,
        date: "Unforgettable Date",
        title: "[MEMORY 3]: Walking Hand in Hand 🌹",
        description: "Holding your hand felt like coming home. Every step with you is my favorite destination.",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop"
      },
      {
        id: 4,
        date: "Today & Always",
        title: "[MEMORY 4]: Celebrating YOU Today 🎂",
        description: "Another year of your grace, kindness, and love. Here's to making infinite more golden memories together!",
        imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop"
      }
    ],
    cakeWishText: "Make a wish and blow out the candles! May all your dreams come true ✨",
    finalSectionTitle: "You are very special to me ❤️",
    finalSectionMessage: "No words in any language could ever fully express how much happiness you bring into my life. Happy Birthday my love! Today, tomorrow, and forever."
  };

  fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to reset data' });
    }
    res.json({ success: true, message: 'Reset to default data successfully!', data: defaultData });
  });
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n✨ Birthday Surprise Server running at http://localhost:${port}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is currently in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
