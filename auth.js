// Ensure Firebase is initialized before using it
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBd73J0In4PTLGi4yarVQKCLK7g04Rbis",
  authDomain: "symple-tunes-59228.firebaseapp.com",
  projectId: "symple-tunes-59228",
  storageBucket: "symple-tunes-59228.appspot.com",
  messagingSenderId: "247211026068",
  appId: "1:247211026068:web:db8f201e2a0d1099ba3681",
  measurementId: "G-N5SB0V6FQ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// EmailJS Configuration
const serviceID = "service_i8neevs";
const templateID = "template_06iydaq";
const publicKey = "dUczuus9AeyI36X1K";

document.addEventListener("DOMContentLoaded", function () {
  // --- Sign Up / OTP / Password Setup Elements ---
  const nameInput = document.getElementById("name");
  const ageInput = document.getElementById("age");
  const usernameSelect = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const nextStepButton = document.getElementById("nextStep");
  const sendEmailButton = document.getElementById("sendEmailCode");
  const otpInput = document.getElementById("otp");
  const verifyOtpButton = document.getElementById("verifyOtp");
  const passwordSection = document.getElementById("passwordSection");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const createAccountButton = document.getElementById("createAccount");

  // --- Sign In & Forgot Password Elements ---
  const signInEmailInput = document.getElementById("loginEmail");
  const signInPasswordInput = document.getElementById("loginPassword");
  const signInButton = document.getElementById("signInButton");
  const forgotPasswordButton = document.getElementById("forgotPasswordLink");

  // --- Form Switching Elements ---
  const switchToSignUp = document.getElementById("switchToSignUp");
  const backToSignInButton = document.getElementById("backToSignIn");

  // --- Profile Setup & Profile Page Elements ---
  const profileSetup = document.getElementById("profileSetup");
  const profilePictureInput = document.getElementById("profilePicture");
  const profileImagePreview = document.getElementById("profileImage");
  const finishSignupButton = document.getElementById("finishSignup");
  const profilePage = document.getElementById("profilePage");
  const displayProfileImage = document.getElementById("displayProfileImage");
  const displayName = document.getElementById("displayName");
  const displayAge = document.getElementById("displayAge");
  const displayUsername = document.getElementById("displayUsername");
  const displayEmail = document.getElementById("displayEmail");
  const displayCountry = document.getElementById("displayCountry");
  const displayPhone = document.getElementById("displayPhone");

  // --- Profile Editing Elements ---
  const editProfileButton = document.getElementById("editProfileButton");
  const saveProfileButton = document.getElementById("saveProfileButton");
  const editName = document.getElementById("editName");
  const editAge = document.getElementById("editAge");
  const editCountry = document.getElementById("editCountry");
  const editPhone = document.getElementById("editPhone");
  const homeButton = document.getElementById("homeButton");

  // Variables to store data during signup
  let signupDetails = {};
  let verificationCode = "";
  let profilePictureDataURL = "";

  // --- Switch to Sign Up ---
  switchToSignUp.addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("signInForm").classList.add("hidden");
    document.getElementById("step1").classList.remove("hidden");
    document.getElementById("auth-title").textContent = "Sign Up";
  });

  // --- Username Generation ---
  function generateUsernames(name, age) {
    if (!name || !age) return [];
    const baseName = name.split(" ")[0].toLowerCase();
    return [
      `${baseName}${age}`,
      `${baseName}_${age}`,
      `${baseName}123`,
      `${baseName}.x${age}`,
      `${baseName}xx${age}`
    ];
  }

  function updateUsernameOptions() {
    usernameSelect.innerHTML = '<option value="">Select a Username</option>';
    const name = nameInput.value.trim();
    const age = ageInput.value.trim();
    if (name && age) {
      const usernames = generateUsernames(name, age);
      usernames.forEach((username) => {
        const option = document.createElement("option");
        option.value = username;
        option.textContent = username;
        usernameSelect.appendChild(option);
      });
    }
  }

  nameInput.addEventListener("input", updateUsernameOptions);
  ageInput.addEventListener("input", updateUsernameOptions);

  // --- Step 1 -> Step 2 (OTP Verification) ---
  nextStepButton.addEventListener("click", function (event) {
    event.preventDefault();
    const selectedUsername = usernameSelect.value;
    const email = emailInput.value.trim();
    if (!selectedUsername || !email) {
      alert("Please fill all fields before proceeding.");
      return;
    }
    // Save details for profile page
    signupDetails = {
      name: nameInput.value.trim(),
      age: ageInput.value.trim(),
      username: selectedUsername,
      email: email,
      country: document.getElementById("countryCode").value,
      phone: document.getElementById("phone").value.trim()
    };
    document.getElementById("step1").classList.add("hidden");
    document.getElementById("step2").classList.remove("hidden");
    sendVerificationEmail(email, selectedUsername);
  });

  function sendVerificationEmail(email, userName) {
    const code = generateVerificationCode();
    verificationCode = code;
    const emailParams = {
      user_name: userName,
      otp_code: code,
      to_email: email
    };
    emailjs.send(serviceID, templateID, emailParams, publicKey)
      .then(() => alert("Verification code sent to your email."))
      .catch(error => alert("Failed to send OTP. Please try again."));
  }

  function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // --- Step 2: OTP Verification ---
  verifyOtpButton.addEventListener("click", function (event) {
    event.preventDefault();
    if (otpInput.value === verificationCode) {
      alert("OTP Verified! Set your password.");
      document.getElementById("step2").classList.add("hidden");
      passwordSection.classList.remove("hidden");
    } else {
      alert("Incorrect OTP. Please try again.");
    }
  });

  // --- Step 3: Password Setup & Account Creation ---
  function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  createAccountButton.addEventListener("click", async function (event) {
    event.preventDefault();
    const selectedUsername = usernameSelect.value;
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!validatePassword(password)) {
      alert("Password must be at least 8 characters, including an uppercase letter, a number, and a special character.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      await setDoc(doc(db, "users", user.uid), { uid: user.uid, username: selectedUsername, email: email });
      alert("Account successfully created! Please verify your email.");
      // Move to profile setup
      passwordSection.classList.add("hidden");
      profileSetup.classList.remove("hidden");
    } catch (error) {
      alert(`Error creating account: ${error.message}`);
    }
  });

  // --- Profile Picture Upload (Profile Setup) ---
  profilePictureInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profilePictureDataURL = e.target.result;
        profileImagePreview.src = profilePictureDataURL;
      };
      reader.readAsDataURL(file);
    } else {
      profilePictureDataURL = "";
      profileImagePreview.src = "default-user-icon.png";
    }
  });

  // --- Finish Signup & Show Profile Page ---
  finishSignupButton.addEventListener("click", function (event) {
    event.preventDefault();
    profileSetup.classList.add("hidden");
    showProfilePage(signupDetails, profilePictureDataURL);
  });

  // --- Handle Sign In ---
  signInButton.addEventListener("click", async function (event) {
    event.preventDefault();
    const email = signInEmailInput.value.trim();
    const password = signInPasswordInput.value;
    if (!email || !password) {
      alert("Please fill all fields before signing in.");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      alert("Signed in successfully!");
      // For sign in, we use email as fallback. In a real-world scenario, fetch full profile details from your DB.
      showProfilePage({ name: user.email, age: "N/A", username: "N/A", email: user.email, country: "N/A", phone: "N/A" }, "");
    } catch (error) {
      alert(`Error signing in: ${error.message}`);
    }
  });

  // --- Handle Forgot Password ---
  forgotPasswordButton.addEventListener("click", async function () {
    const email = signInEmailInput.value.trim();
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      alert(`Error sending password reset email: ${error.message}`);
    }
  });

  // --- Function to Show Profile Page ---
  function showProfilePage(details, profilePic) {
    // Update profile fields
    displayName.textContent = details.name;
    displayAge.textContent = details.age;
    displayUsername.textContent = details.username;
    displayEmail.textContent = details.email;
    displayCountry.textContent = details.country;
    displayPhone.textContent = details.phone;
    // Set profile picture (as an image) or default
    displayProfileImage.src = profilePic ? profilePic : "default-user-icon.png";
    
    // Hide all other sections and show the profile page
    document.getElementById("signInForm").classList.add("hidden");
    document.getElementById("forgotPasswordForm").classList.add("hidden");
    document.getElementById("step1").classList.add("hidden");
    document.getElementById("step2").classList.add("hidden");
    document.getElementById("passwordSection").classList.add("hidden");
    profileSetup.classList.add("hidden");
    profilePage.classList.remove("hidden");
    document.getElementById("auth-title").textContent = "Your Profile";
  }

  // --- Profile Editing ---
  editProfileButton.addEventListener("click", function () {
    // Populate edit fields with current values
    editName.value = displayName.textContent;
    editAge.value = displayAge.textContent;
    editCountry.value = displayCountry.textContent;
    editPhone.value = displayPhone.textContent;
    // Show the edit inputs
    editName.classList.remove("hidden");
    editAge.classList.remove("hidden");
    editCountry.classList.remove("hidden");
    editPhone.classList.remove("hidden");
    // Toggle buttons
    editProfileButton.classList.add("hidden");
    saveProfileButton.classList.remove("hidden");
  });

  saveProfileButton.addEventListener("click", function () {
    // Update the display values
    displayName.textContent = editName.value;
    displayAge.textContent = editAge.value;
    displayCountry.textContent = editCountry.value;
    displayPhone.textContent = editPhone.value;
    // Hide the edit inputs
    editName.classList.add("hidden");
    editAge.classList.add("hidden");
    editCountry.classList.add("hidden");
    editPhone.classList.add("hidden");
    // Toggle buttons back
    saveProfileButton.classList.add("hidden");
    editProfileButton.classList.remove("hidden");
  });

  // --- Home Button: Redirect to Main Page ---
  homeButton.addEventListener("click", function () {
    window.location.href = "index.html"; // Update this URL as needed for your main page
  });
});
