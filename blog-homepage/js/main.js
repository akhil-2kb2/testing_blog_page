document.addEventListener("DOMContentLoaded", () => {
  // --- Common Functions for All Pages ---
  
  // Update navigation links based on auth state.
  function updateNav() {
    const navLinks = document.getElementById("navLinks");
    if (!navLinks) return;
    navLinks.innerHTML = "";
    
    // Always include Home.
    const homeLink = document.createElement("li");
    homeLink.innerHTML = '<a href="index.html">Home</a>';
    navLinks.appendChild(homeLink);
    
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      const profileLink = document.createElement("li");
      profileLink.innerHTML = '<a href="profile.html">Profile</a>';
      navLinks.appendChild(profileLink);
      
      const logoutLink = document.createElement("li");
      logoutLink.innerHTML = '<a href="#" id="navLogout">Logout</a>';
      navLinks.appendChild(logoutLink);
      
      document.getElementById("navLogout").addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    } else {
      const loginLink = document.createElement("li");
      loginLink.innerHTML = '<a href="login.html">Login</a>';
      navLinks.appendChild(loginLink);
      
      const registerLink = document.createElement("li");
      registerLink.innerHTML = '<a href="register.html">Register</a>';
      navLinks.appendChild(registerLink);
    }
  }
  
  // Dark Mode Toggle with Persistence.
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    if (darkModeToggle) darkModeToggle.textContent = "Light Mode";
  }
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDark);
      darkModeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    });
  }
  
  function logout() {
    localStorage.removeItem("loggedInUser");
    updateNav();
    if (document.body.dataset.page === "profile") {
      window.location.href = "login.html";
    }
  }
  
  // --- Authentication Pages (login, register, profile) Handling ---
  const pageType = document.body.dataset.page;
  
  if (pageType === "login") {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;
      
      let users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        alert("Login successful!");
        window.location.href = "profile.html";
      } else {
        alert("Invalid credentials. Please try again.");
      }
    });
  } else if (pageType === "register") {
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("regUsername").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value;
      const confirmPassword = document.getElementById("regConfirmPassword").value;
      
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      
      let users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.find(u => u.username === username)) {
        alert("Username already exists!");
        return;
      }
      
      const newUser = { username, email, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("loggedInUser", JSON.stringify(newUser));
      alert("Registration successful!");
      window.location.href = "profile.html";
    });
  } else if (pageType === "profile") {
    const profileContent = document.getElementById("profileContent");
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
      profileContent.innerHTML = `
        <p><strong>Username:</strong> ${loggedInUser.username}</p>
        <p><strong>Email:</strong> ${loggedInUser.email}</p>
      `;
    } else {
      window.location.href = "login.html";
    }
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => { logout(); });
  }
  
  // --- Homepage (Posts Listing) ---
  else if (pageType === "home") {
    // Sample posts data with IDs (for linking to post.html?id=ID)
    const postsData = getPostsData();
    
    let postsDisplayed = 0;
    const postsPerPage = 4;
    const postGrid = document.getElementById("postGrid");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const searchInput = document.getElementById("searchInput");
    
    function renderPosts(postsArray) {
      postsArray.forEach(post => {
        const postEl = document.createElement("div");
        postEl.className = "post";
        // Link each post to its detailed view by adding a clickable link wrapping the image/title.
        postEl.innerHTML = `
          <a href="post.html?id=${post.id}">
            <img src="${post.image}" alt="${post.category}">
            <div class="post-content">
              <div class="post-category">${post.category}</div>
              <div class="post-title">${post.title}</div>
              <div class="post-description">${post.description}</div>
            </div>
          </a>
        `;
        postGrid.appendChild(postEl);
      });
    }
    
    function loadMorePosts() {
      const nextPosts = postsData.slice(postsDisplayed, postsDisplayed + postsPerPage);
      renderPosts(nextPosts);
      postsDisplayed += postsPerPage;
      if (postsDisplayed >= postsData.length) {
        loadMoreBtn.style.display = "none";
      }
    }
    
    loadMorePosts();
    
    loadMoreBtn.addEventListener("click", loadMorePosts);
    
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      postGrid.innerHTML = "";
      if (query !== "") {
        const filteredPosts = postsData.filter(post =>
          post.title.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query)
        );
        renderPosts(filteredPosts);
        loadMoreBtn.style.display = "none";
      } else {
        postsDisplayed = 0;
        loadMoreBtn.style.display = "block";
        loadMorePosts();
      }
    });
    
    // Back-to-Top Button
    const backToTopBtn = document.getElementById("backToTop");
    window.addEventListener("scroll", () => {
      backToTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  
  // --- Post Detail Page ---
  else if (pageType === "post") {
    // Helper: return sample posts data. In a real app, this data may be fetched from a server.
    const postsData = getPostsData();
    
    // Get post ID from URL query string.
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id") ? parseInt(urlParams.get("id"), 10) : 1;
    const post = postsData.find(p => p.id === postId);
    if (!post) {
      alert("Post not found");
      return;
    }
    
    // Populate post details.
    document.getElementById("postTitle").textContent = post.title;
    document.getElementById("postImage").src = post.image;
    // Use detailed content if available; fallback to description.
    document.getElementById("postContent").innerHTML = `<p>${post.content || post.description}</p>`;
    
    // Social Sharing Links (using current URL).
    const currentUrl = encodeURIComponent(window.location.href);
    document.getElementById("twitterShare").href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${currentUrl}`;
    document.getElementById("facebookShare").href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
    document.getElementById("linkedInShare").href = `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${encodeURIComponent(post.title)}`;
    
    // Like Button functionality.
    const likeButton = document.getElementById("likeButton");
    const likeCountSpan = document.getElementById("likeCount");
    const likeKey = `postLikes_${postId}`;
    let likeCount = parseInt(localStorage.getItem(likeKey), 10) || 0;
    likeCountSpan.textContent = likeCount;
    likeButton.addEventListener("click", () => {
      likeCount++;
      localStorage.setItem(likeKey, likeCount);
      likeCountSpan.textContent = likeCount;
    });
    
    // Comments functionality.
    const commentForm = document.getElementById("commentForm");
    const commentsList = document.getElementById("commentsList");
    const commentsKey = `comments_${postId}`;
    
    function renderComments() {
      commentsList.innerHTML = "";
      const comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
      if (comments.length === 0) {
        commentsList.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
        return;
      }
      comments.forEach(comment => {
        const commentDiv = document.createElement("div");
        commentDiv.className = "comment";
        commentDiv.innerHTML = `<p><strong>${comment.username || "Guest"}:</strong> ${comment.text}</p>
                                <p class="comment-date">${new Date(comment.date).toLocaleString()}</p>`;
        commentsList.appendChild(commentDiv);
      });
    }
    
    renderComments();
    
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const commentText = document.getElementById("commentText").value.trim();
      if (!commentText) return;
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const username = loggedInUser ? loggedInUser.username : "Guest";
      const newComment = {
        username,
        text: commentText,
        date: new Date().toISOString()
      };
      const comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
      comments.push(newComment);
      localStorage.setItem(commentsKey, JSON.stringify(comments));
      document.getElementById("commentText").value = "";
      renderComments();
    });
  }
  
  // Always update navigation on load.
  updateNav();
  
  // --- Utility: Sample posts data ---
  // In a real-world app, you might fetch this from an API.
  function getPostsData() {
    return [
      {
        id: 1,
        image: "https://media.istockphoto.com/id/2175894329/photo/hotel-service-management-system-concept-digital-network-business-investment-technology.webp?a=1&b=1&s=612x612&w=0&k=20&c=kKWPKhNW9bVQzR4ddiatTNdlJDLNxz2I9pyWjVviyZo=",
        category: "Technology",
        title: "Innovations in AI",
        description: "Discover the latest advancements in artificial intelligence and their impact on our daily lives.",
        content: "Here is the detailed content of the post talking about the various innovations in artificial intelligence, recent breakthroughs, and future applications..."
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop&q=60",
        category: "Travel",
        title: "Journey Through the Alps",
        description: "Experience the breathtaking beauty of the mountains and the diverse cultures flourishing there.",
        content: "Detailed narrative of an unforgettable journey through the Alps, describing the picturesque landscapes and cultural encounters along the way..."
      },
      
      {
        id: 3,
        image: "https://plus.unsplash.com/premium_photo-1664360971698-0c07d3551bed?w=900&auto=format&fit=crop&q=60",
        category: "Lifestyle",
        title: "Healthy Living Tips",
        description: "Learn simple ways to maintain a healthy lifestyle through diet, exercise, and mindfulness.",
        content: "In this post, we discuss proven tips and strategies for a healthier, more balanced life that includes nutritional advice, fitness routines, and mindfulness practices..."
      },
      {
        id: 4,
        image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=900&auto=format&fit=crop&q=60",
        category: "Food",
        title: "Delicious Recipes for Beginners",
        description: "Explore easy-to-make recipes that are perfect for those just starting their culinary journey.",
        content: "This post provides step-by-step instructions for creating simple yet delicious dishes, perfect for beginners looking to enhance their cooking skills..."
      },
      {
        id: 5,
        image: "https://images.unsplash.com/photo-1517638851339-4c1d2f7fb8c5?w=900&auto=format&fit=crop&q=60",
        category: "Fitness",
        title: "Top 10 Home Workouts",
        description: "Stay fit and active with these effective home workout routines that require no equipment.",
        content: "Discover a variety of home workout routines that target different muscle groups, helping you stay fit without the need for a gym membership..."
      },
      {
        id: 6,
        image: "https://plus.unsplash.com/premium_vector-1698190222681-738aaf92f330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXJjaGl0ZWN0dXJlfGVufDB8fDB8fHww",
        category: "Travel",
        title: "Exploring the Great Outdoors",
        description: "A guide to the best hiking trails and outdoor adventures around the world.",
        content: "This post highlights some of the most breathtaking hiking trails and outdoor activities, perfect for nature lovers and adventure seekers..."
      },
      {
        id: 7,
        image: "https://images.unsplash.com/photo-1517638851339-4c1d2f7fb8c5?w=900&auto=format&fit=crop&q=60",
        category: "Technology",
        title: "The Future of Blockchain",
        description: "Understanding the potential of blockchain technology beyond cryptocurrencies.",
        content: "In this article, we explore the various applications of blockchain technology in different sectors, including finance, healthcare, and supply chain..."
      },
      {
        id: 8,
        image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=900&auto=format&fit=crop&q=60",
        category: "Food",
        title: "Gourmet Cooking at Home",
        description: "Elevate your home cooking with these gourmet recipes and techniques.",
        content: "This post provides insights into gourmet cooking techniques and recipes that can be easily replicated at home for an elevated dining experience..."
      },
      {
        id: 9,
        image: "https://images.unsplash.com/photo-1517638851339-4c1d2f7fb8c5?w=900&auto=format&fit=crop&q=60",
        category: "Lifestyle",
        title: "Mindfulness and Meditation",
        description: "Discover the benefits of mindfulness and meditation for mental well-being.",
        content: "This article discusses the importance of mindfulness and meditation practices, providing tips and techniques for incorporating them into daily life..."
      },
      {
        id: 10,
        image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=900&auto=format&fit=crop&q=60",
        category: "Fitness",
        title: "Yoga for Beginners",
        description: "A beginner's guide to yoga, including poses and benefits.",
        content: "This post introduces the basics of yoga, including essential poses and their benefits for physical and mental health..."
      },
      {
        id: 11,
        image: "https://images.unsplash.com/photo-1517638851339-4c1d2f7fb8c5?w=900&auto=format&fit=crop&q=60",
        category: "Travel",
        title: "Cultural Festivals Around the World",
        description: "Experience the vibrant cultures through their festivals and traditions.",
        content: "This article explores various cultural festivals around the world, highlighting their significance and unique traditions..."
      },
      {
        id: 12,
        image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=900&auto=format&fit=crop&q=60",
        category: "Technology",
        title: "Cybersecurity Essentials",
        description: "Protect your digital life with these essential cybersecurity tips.",
        content: "This post provides practical tips for enhancing your cybersecurity, including password management, safe browsing practices, and recognizing phishing attempts..."
      },
      {
        id: 13,
        image: "https://images.unsplash.com/photo-1517638851339-4c1d2f7fb8c5?w=900&auto=format&fit=crop&q=60",
        category: "Food",
        title: "Baking Basics for Beginners",
        description: "Learn the fundamentals of baking with these easy recipes and tips.",
        content: "This article covers the basics of baking, including essential techniques and beginner-friendly recipes to get you started in the kitchen..."
      },
      {
        id: 14,
        image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=900&auto=format&fit=crop&q=60",
        category: "Lifestyle",
        title: "Sustainable Living Practices",
        description: "Adopt eco-friendly habits for a more sustainable lifestyle.",
        content: "This post discusses various sustainable living practices that can be easily integrated into daily life to reduce environmental impact..."
      },
      {
        id: 15,
        image: "https://images.unsplash.com/photo-1517638851339-4c1d2f7fb8c5?w=900&auto=format&fit=crop&q=60",
        category: "Fitness",
        title: "The Benefits of Running",
        description: "Explore the physical and mental benefits of running as a form of exercise.",
        content: "This article highlights the numerous benefits of running, including improved cardiovascular health, mental clarity, and stress relief..."
      },
      {
        id: 16,
        image: "https://images.unsplash.com/photo-1517638851339-4c1d2f7fb8c5?w=900&auto=format&fit=crop&q=60",
        category: "Travel",
        title: "Hidden Gems in Europe",
        description: "Discover lesser-known travel destinations in Europe that are worth exploring.",
        content: "This post showcases some of the hidden gems in Europe, offering unique travel experiences away from the typical tourist spots..."
      },
      {
        id: 17,
        image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=900&auto=format&fit=crop&q=60",
        category: "Technology",
        title: "The Rise of Remote Work",
        description: "Understanding the impact of remote work on the modern workforce.",
        content: "This article discusses the rise of remote work, its benefits and challenges, and how it is reshaping the future of work..."
      },
      {
        id: 18,
        image: "https://images.unsplash.com/photo-1517638851339-4c1d2f7fb8c5?w=900&auto=format&fit=crop&q=60",
        category: "Food",
        title: "Exploring World Cuisines",
        description: "A culinary journey through different cultures and their unique dishes.",
        content: "This post takes you on a culinary journey, exploring various world cuisines and their signature dishes..."
      },
      {
        id: 19,
        image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=900&auto=format&fit=crop&q=60",
        category: "Lifestyle",
        title: "Decluttering Your Space",
        description: "Tips for decluttering your home and creating a more organized environment.",
        content: "This article provides practical tips for decluttering your space, helping you create a more organized and peaceful living environment..."
      },
      {
        id: 20,
        image: "https://images.unsplash.com/photo-1517638851339-4c1d2f7fb8c5?w=900&auto=format&fit=crop&q=60",
        category: "Fitness",
        title: "Strength Training Basics",
        description: "An introduction to strength training for beginners.",
        content: "This post covers the basics of strength training, including essential exercises and tips for getting started..."
      }
      // Add more posts as needed...

    ];
  }
});
