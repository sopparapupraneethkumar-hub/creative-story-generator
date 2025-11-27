document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const themeToggle = document.querySelector('.theme-toggle');
  const contactForm = document.getElementById('contact-form');
  const faqItems = document.querySelectorAll('.faq-item');
  const API_KEY = 'AIzaSyAieLdU_VuC-f5-p7YN7PVzDlEf9UhcoQM'; // Replace with your actual Gemini API key

  // Theme toggle functionality
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('light-theme')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // FAQ functionality
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // Contact form handling
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      try {
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success message
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';

        // Reset form
        contactForm.reset();

        // Reset button after 2 seconds
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = 'linear-gradient(135deg, #64ffda 0%, #1e90ff 100%)';
          submitBtn.disabled = false;
        }, 2000);
      } catch (error) {
        // Show error message
        submitBtn.innerHTML = '<i class="fas fa-times"></i> Error';
        submitBtn.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';

        // Reset button after 2 seconds
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = 'linear-gradient(135deg, #64ffda 0%, #1e90ff 100%)';
          submitBtn.disabled = false;
        }, 2000);
      }
    });
  }

  // Function to add a message to the chat
  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'coach'}`;
    messageDiv.innerHTML = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Function to show loading state
  function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message coach loading';
    loadingDiv.innerHTML = '<p>Thinking...</p>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
  }

  // Function to remove loading state
  function removeLoading(loadingDiv) {
    loadingDiv.remove();
  }

  // Function to call Gemini API
  async function callGeminiAPI(userInput, prompt) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${prompt}\n\nUser input: "${userInput}"`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  // Handle sending messages
  async function handleSend() {
    const message = userInput.value.trim();
    if (message) {
      // Add user message
      addMessage(`<p>${message}</p>`, true);

      // Clear input
      userInput.value = '';

      // Show loading state
      const loadingDiv = showLoading();

      try {
        // Get response from Gemini API
        const response = await callGeminiAPI(message);

        // Remove loading state
        removeLoading(loadingDiv);

        // Add coach response
        addMessage(`<p>${response}</p>`);
      } catch (error) {
        // Remove loading state
        removeLoading(loadingDiv);

        // Show error message
        addMessage('<p>Sorry, I encountered an error. Please try again later.</p>');
      }
    }
  }

  // Event listeners
  if (sendButton) {
    sendButton.addEventListener('click', handleSend);
  }

  if (userInput) {
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  function checkAuthState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userProfileSection = document.getElementById('userProfileSection');
    const authLinks = document.getElementById('authLinks');
    const userName = document.getElementById('userName');
    const userRegNo = document.getElementById('userRegNo');

    if (currentUser) {
      // User is logged in
      userProfileSection.style.display = 'flex';
      authLinks.style.display = 'none';
      userName.textContent = currentUser.name;
      userRegNo.textContent = currentUser.regNo;
    } else {
      // User is logged out
      userProfileSection.style.display = 'none';
      authLinks.style.display = 'flex';
    }
  }

  function logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
  }

  // Call checkAuthState when the page loads
  document.addEventListener('DOMContentLoaded', checkAuthState);

  // Writing Assistant Functions
  function initializeWritingAssistant() {
    const sections = [
      {
        id: 'brainstorming',
        prompt: `As a creative writing coach, help brainstorm ideas for school-related writing. Consider:
          1. Different types of school experiences and perspectives
          2. Potential themes and conflicts in academic settings
          3. Character dynamics between students, teachers, and staff
          4. Unique settings within the school environment
          5. Plot ideas involving academic and personal growth
          Please provide detailed, creative suggestions for each category.`
      },
      {
        id: 'clarity',
        prompt: `As a writing clarity expert, analyze this text with a focus on academic writing standards:
          1. Academic language and formal tone
          2. Logical flow and argument structure
          3. Paragraph organization and transitions
          4. Clarity of ideas and concepts
          5. Supporting evidence and examples
          Provide specific suggestions for improving academic writing clarity.`
      },
      {
        id: 'structure',
        prompt: `As a writing structure expert, analyze this academic text's organization:
          1. Thesis statement and main arguments
          2. Introduction and conclusion effectiveness
          3. Paragraph structure and topic sentences
          4. Evidence presentation and analysis
          5. Overall academic paper organization
          Provide detailed recommendations for improving the structure.`
      },
      {
        id: 'grammar',
        prompt: `As an academic writing expert, review this text for:
          1. Grammar and punctuation
          2. Academic style and formal language
          3. Sentence structure variety
          4. Word choice and vocabulary
          5. Common academic writing errors
          Provide specific corrections and suggestions for improvement.`
      },
      {
        id: 'tone',
        prompt: `As an academic tone expert, analyze this text for:
          1. Academic voice and formality
          2. Consistency in scholarly tone
          3. Professional language use
          4. Audience-appropriate terminology
          5. Objective and analytical stance
          Provide specific recommendations for achieving proper academic tone.`
      },
      {
        id: 'character',
        prompt: `As a character development expert in academic narratives, analyze:
          1. Character depth and motivation in academic settings
          2. Realistic portrayal of students/teachers/staff
          3. Educational and personal growth arcs
          4. Interpersonal dynamics in academic contexts
          5. Character authenticity in school environments
          Provide detailed suggestions for developing compelling academic characters.`
      }
    ];

    sections.forEach(section => {
      const button = document.getElementById(`${section.id}-button`);
      const input = document.getElementById(`${section.id}-input`);
      const resultsArea = document.getElementById(`${section.id}-results`);
      
      if (button && input && resultsArea) {
        button.addEventListener('click', async () => {
          const text = input.value.trim();
          
          if (!text) {
            alert('Please enter some text first!');
            return;
          }
          
          // Show loading state
          button.disabled = true;
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
          resultsArea.classList.add('active');
          resultsArea.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Generating response...</div>';
          
          try {
            const response = await callGeminiAPI(text, section.prompt);
            displayResults(resultsArea, response);
          } catch (error) {
            console.error('Error:', error);
            resultsArea.innerHTML = '<div class="error">Sorry, there was an error processing your request. Please try again later.</div>';
          } finally {
            // Reset button state
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-paper-plane"></i> ${getButtonText(section.id)}`;
          }
        });
      }
    });
  }

  function displayResults(resultsArea, response) {
    // Format the response text with proper HTML
    let formattedText = response
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Add headers for sections
    formattedText = formattedText.replace(/(\d+\.\s+[A-Za-z\s]+):/g, '<h3>$1</h3>');
    
    // Wrap in paragraph tags
    formattedText = `<div class="results-content"><p>${formattedText}</p></div>`;
    
    resultsArea.innerHTML = formattedText;
  }

  function getButtonText(section) {
    const buttonTexts = {
      brainstorming: 'Get Ideas',
      clarity: 'Improve Text',
      structure: 'Structure Content',
      grammar: 'Check & Improve',
      tone: 'Analyze Tone',
      character: 'Get Feedback'
    };
    return buttonTexts[section];
  }

  // Initialize writing assistant when the page loads
  initializeWritingAssistant();
}); 