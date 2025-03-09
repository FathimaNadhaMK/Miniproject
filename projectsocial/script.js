// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAGdk33zLW1Y0zWoS8756WI9a_hgSKPueQ",
    authDomain: "socialsite-30f8a.firebaseapp.com",
    projectId: "socialsite-30f8a",
    storageBucket: "socialsite-30f8a.appspot.com",
    messagingSenderId: "209572402876",
    appId: "1:209572402876:web:6e1e1d2501dd81143962b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Navigation handlers
function showLogin() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('homePage').style.display = 'none';
}

function showSignup() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'block';
    document.getElementById('homePage').style.display = 'none';
}

function showHome() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('homePage').style.display = 'block';
}

// Event listeners for navigation links
document.getElementById('showSignupLink').addEventListener('click', showSignup);
document.getElementById('showLoginLink').addEventListener('click', showLogin);

// Handle Login
document.getElementById('loginBtn').addEventListener('click', function () {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showHome();
        })
        .catch(error => {
            alert(error.message);
        });
});

// Handle Signup
document.getElementById('signupBtn').addEventListener('click', function () {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            addDoc(collection(db, "users"), {
                uid: user.uid,
                name: name,
                email: email
            });
            alert("Signup successful! Please login.");
            showLogin();
        })
        .catch(error => {
            alert(error.message);
        });
});

// Post messages
document.getElementById('postMessageBtn').addEventListener('click', function () {
    const message = document.getElementById('messageInput').value;
    addDoc(collection(db, "messages"), {
        message: message,
        timestamp: new Date(),
        user: auth.currentUser.uid
    }).then(() => {
        document.getElementById('messageInput').value = '';
    }).catch(error => {
        alert(error.message);
    });
});

// Display messages
onSnapshot(query(collection(db, "messages"), orderBy("timestamp")), snapshot => {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = data.message;
        messagesList.appendChild(messageElement);
    });
});
