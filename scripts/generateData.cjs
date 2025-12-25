#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const userCount = parseInt(args[0]) || 20;
const storyCount = parseInt(args[1]) || 50;

const firstNames = [
  'John', 'Jane', 'Mike', 'Sarah', 'David', 'Alex', 'Lisa', 'Robert', 'Emily', 'Tommy',
  'Sofia', 'Mark', 'Anna', 'Chris', 'Diana', 'Kevin', 'Laura', 'Brian', 'Nicole', 'Ryan',
  'Emma', 'Daniel', 'Olivia', 'James', 'Ava', 'William', 'Mia', 'Benjamin', 'Charlotte', 'Lucas',
  'Amelia', 'Henry', 'Harper', 'Alexander', 'Evelyn', 'Sebastian', 'Abigail', 'Jack', 'Ella', 'Owen'
];

const lastNames = [
  'Doe', 'Smith', 'Brown', 'Wilson', 'Lee', 'Cheng', 'Marie', 'Davis', 'Jones', 'Nguyen',
  'Patel', 'Zhao', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Walker', 'Hall',
  'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill'
];

const captions = [
  'Beautiful sunset! 🌅', 'Coffee time ☕', 'Workout done! 💪', 'Healthy breakfast 🥗',
  'New project launch! 🚀', 'Team meeting', 'Travel vibes ✈️', 'Beach day 🏖️',
  'Food photography 📸', 'City lights at night 🌃', 'Weekend movie night 🍿🎬',
  'New art supplies! 🎨', 'Morning run in the park 🏃‍♀️', 'Documentary filmmaking 🎥',
  'Bookstore finds 📚', 'Coding marathon day 💻', 'Homemade pizza night 🍕',
  'Business conference highlights', 'Mountain hiking adventure 🏔️', 'Street photography session',
  'Road trip memories 🚗', 'Yoga by the beach 🧘‍♀️', 'New recipe success! 👨‍🍳',
  'Studio recording session 🎤', 'Skateboard tricks practice 🛹', 'Gaming session 🎮',
  'Pet adventures 🐕', 'Garden vibes 🌻', 'Reading time 📖', 'Music practice 🎸'
];

const replyMessages = [
  'Amazing! 😍', 'Love this!', 'So cool! 🔥', 'Awesome shot!', 'Where is this?',
  'Need to try this!', 'Beautiful!', 'Goals! 💯', 'Wow!', 'This is great!',
  'Keep it up! 💪', 'Incredible view!', 'So inspiring!', 'Want to be there!',
  'Share more please!', 'Looks delicious!', 'Nice one!', 'Perfect!', 'Love it! ❤️'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo = 7) {
  const now = new Date();
  const past = new Date(now.getTime() - randomInt(0, daysAgo * 24 * 60 * 60 * 1000));
  return past.toISOString();
}

function generateUsername(firstName, lastName, id) {
  const styles = [
    () => `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    () => `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    () => `${firstName.toLowerCase()}${randomInt(1, 99)}`,
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase().slice(0, 3)}`,
  ];
  return randomElement(styles)();
}

function generateUsers(count) {
  const users = [];
  const usedUsernames = new Set();

  for (let i = 1; i <= count; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    let username = generateUsername(firstName, lastName, i);
    
    // Ensure unique username
    while (usedUsernames.has(username)) {
      username = `${username}${randomInt(1, 999)}`;
    }
    usedUsernames.add(username);

    users.push({
      id: i,
      username,
      fullName: `${firstName} ${lastName}`,
      profilePicture: `https://i.pravatar.cc/150?img=${randomInt(1, 70)}`,
      isVerified: Math.random() > 0.7
    });
  }
  return users;
}

function generateStories(count, userCount) {
  const stories = [];
  
  for (let i = 1; i <= count; i++) {
    stories.push({
      id: i,
      userId: randomInt(1, userCount),
      mediaType: 'image',
      mediaUrl: `https://picsum.photos/400/700?random=${i}`,
      caption: randomElement(captions),
      timestamp: randomDate(3),
      duration: randomInt(5, 15),
      views: randomInt(50, 2500),
      hasViewed: Math.random() > 0.7
    });
  }
  return stories;
}

function generateStoryViews(stories, userCount) {
  const views = [];
  let viewId = 1;

  stories.forEach(story => {
    const viewCount = randomInt(0, 5);
    const viewedUsers = new Set();
    
    for (let i = 0; i < viewCount; i++) {
      let userId = randomInt(1, userCount);
      while (viewedUsers.has(userId) || userId === story.userId) {
        userId = randomInt(1, userCount);
      }
      viewedUsers.add(userId);

      views.push({
        id: viewId++,
        storyId: story.id,
        userId,
        timestamp: randomDate(2)
      });
    }
  });
  return views;
}

function generateStoryReplies(stories, userCount) {
  const replies = [];
  let replyId = 1;

  stories.forEach(story => {
    if (Math.random() > 0.6) {
      const replyCount = randomInt(1, 3);
      const repliedUsers = new Set();

      for (let i = 0; i < replyCount; i++) {
        let userId = randomInt(1, userCount);
        while (repliedUsers.has(userId) || userId === story.userId) {
          userId = randomInt(1, userCount);
        }
        repliedUsers.add(userId);

        replies.push({
          id: replyId++,
          storyId: story.id,
          userId,
          message: randomElement(replyMessages),
          timestamp: randomDate(2)
        });
      }
    }
  });
  return replies;
}

// Generate data
console.log(`Generating ${userCount} users and ${storyCount} stories...`);

const users = generateUsers(userCount);
const stories = generateStories(storyCount, userCount);
const storyViews = generateStoryViews(stories, userCount);
const storyReplies = generateStoryReplies(stories, userCount);

const db = {
  users,
  stories,
  storyViews,
  storyReplies
};

// Write to file
const outputPath = path.join(__dirname, '../src/data/db.json');
fs.writeFileSync(outputPath, JSON.stringify(db, null, 2));

console.log(`Done! Generated:`);
console.log(`  - ${users.length} users`);
console.log(`  - ${stories.length} stories`);
console.log(`  - ${storyViews.length} story views`);
console.log(`  - ${storyReplies.length} story replies`);
console.log(`Output: ${outputPath}`);
