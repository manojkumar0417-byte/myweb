/* ==========================================================================
   API SERVICE LAYER
   Communicates with Express backend REST APIs
   ========================================================================== */

const ApiService = {
  baseUrl: '/api',

  async fetchSurpriseData() {
    try {
      const response = await fetch(`${this.baseUrl}/surprise`);
      if (!response.ok) {
        throw new Error('Failed to fetch surprise data');
      }
      const data = await response.json();
      localStorage.setItem('birthdaySurpriseData', JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn('API fetch error, attempting local storage fallback:', err);
      const local = localStorage.getItem('birthdaySurpriseData');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (e) {}
      }
      return this.getDefaultFallbackData();
    }
  },

  async updateSurpriseData(data) {
    // Always persist to local storage first
    try {
      localStorage.setItem('birthdaySurpriseData', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    try {
      const response = await fetch(`${this.baseUrl}/surprise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        console.warn('Backend server returned non-ok status, fallback to client storage');
      } else {
        return await response.json();
      }
    } catch (err) {
      console.warn('API update endpoint unreachable, data saved locally in browser:', err);
    }
    return { success: true, message: 'Surprise updated locally!', data };
  },

  async resetSurpriseData() {
    localStorage.removeItem('birthdaySurpriseData');
    const defaultData = this.getDefaultFallbackData();
    try {
      const response = await fetch(`${this.baseUrl}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('API reset endpoint unreachable, reset locally:', err);
    }
    return { success: true, message: 'Reset to default data successfully!', data: defaultData };
  },

  getDefaultFallbackData() {
    return {
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
  }
};
