from flask import Flask, request, render_template, redirect, url_for, session, jsonify
from flask_login import (
    UserMixin,
    login_user,
    LoginManager,
    login_required,
    logout_user,
    current_user,
)

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

import smtplib
from email.mime.text import MIMEText
import random
import email_validator
import bcrypt
import ast
import time
import requests
import base64
import os
from dotenv import load_dotenv
from threading import Lock
from openai import OpenAI
import google.generativeai as genai



app = Flask(__name__)

load_dotenv()

flask_secret_key = os.getenv("FLASK_SECRET_KEY")
google_cloud_api_key = os.getenv("GOOGLE_CLOUD_API_KEY")
smtp_server = os.getenv("SMTP_SERVER")
reset_password_smtp_username = os.getenv("RESET_PASSWORD_SMTP_USERNAME")
reset_password_smtp_password = os.getenv("RESET_PASSWORD_SMTP_PASSWORD")
create_account_smtp_username = os.getenv("CREATE_ACCOUNT_SMTP_USERNAME")
create_account_smtp_password = os.getenv("CREATE_ACCOUNT_SMTP_PASSWORD")
gpt_key = os.getenv("GPT_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")


# secret key for session management
app.secret_key = flask_secret_key

db_cred = credentials.Certificate("database_key.json")
firebase_admin.initialize_app(db_cred)
db = firestore.client()
user_collection = db.collection("users")

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

gptclient = OpenAI(api_key=gpt_key)
ai_learning_chat_messages = {}

genai.configure(api_key=gemini_api_key)


@login_manager.user_loader
def load_user(user_id):

    if isinstance(user_id, str) and user_id.startswith("{"):
        user_id_dict = ast.literal_eval(user_id)
        uid = int(user_id_dict["N"])
    else:
        uid = int(user_id)

    query = user_collection.where("id", "==", uid)

    docs = list(query.stream())

    if any(docs):
        for doc in docs:
            doc_dict = doc.to_dict()
            user = User(
                id=str(doc_dict["id"]),
                username=doc_dict["username"],
                password=doc_dict["password"],
            )
            return user
    return None


class User(UserMixin):
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

    @property
    def is_active(self):
        # This should return True if the user's account is active.
        # You might want to check a database field to see if the account is active.
        # For this example, we'll just return True.
        return True


def isValidEmail(email):
    try:
        email_validator.validate_email(email)
        return True
    except email_validator.EmailNotValidError:
        return False


def send_otp_email(email, otp):
    smtp_port = 587

    # Create the message
    msg = MIMEText(f"Your OTP is: {otp}")
    msg["Subject"] = "Your OTP"
    msg["From"] = reset_password_smtp_username
    msg["To"] = email

    # Send the message
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(reset_password_smtp_username, reset_password_smtp_password)
    server.send_message(msg)
    server.quit()


def send_signup_otp_email(email, otp):
    smtp_port = 587

    # Create the message
    msg = MIMEText(f"Your OTP is: {otp}")
    msg["Subject"] = "Your OTP"
    msg["From"] = create_account_smtp_username
    msg["To"] = email

    # Send the message
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(create_account_smtp_username, create_account_smtp_password)
    server.send_message(msg)
    server.quit()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/exit")
def exit():
    return render_template("thankyou.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/forgot_password")
def forgot_password():
    return render_template("forgot_password.html")


@app.route("/ai_learning")
@login_required
def ai_learning():
    return render_template("ai_learning.html")


@app.route("/stock_visualization")
@login_required
def stock_visualization():
    return render_template("stock_visualization.html")

@app.route("/stock_rec")
@login_required
def stock_rec():
    return render_template("stock_rec.html")

@app.route("/rescources")
@login_required
def rescourses():
    return render_template("rescources.html")


@app.route("/home")
@login_required
def home():
    return render_template("home.html")


@app.route("/login_check", methods=["POST"])
def login_check():
    data = request.get_json()
    if data:
        username = data.get("username")
        password = data.get("password")

        login_successful = False

        query = user_collection.where("username", "==", username)

        docs = list(query.stream())

        if any(docs):
            for doc in docs:
                doc_dict = doc.to_dict()

                print(doc_dict)

                if bcrypt.checkpw(
                    password.encode("utf-8"), doc_dict["password"].encode("utf-8")
                ):
                    user = User(
                        id=str(doc_dict["id"]),
                        username=doc_dict["username"],
                        password=doc_dict["password"],
                    )
                    login_user(user)
                    login_successful = True
                    session["user_id"] = doc_dict["id"]

        if login_successful:
            return {"message": "Login successful"}
        else:
            print(f"Invalid username or password: {username}")
            return {"error": "Invalid username or password"}
    else:
        return {"error": "No data received"}


@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return {"success": True}


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if data:
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return {"error": "Missing fields"}

        if len(username) < 3:
            return {"error": "Username should be at least 3 characters long"}

        if not isValidEmail(email):
            return {"error": "Invalid email"}

        if len(password) < 6:
            return {"error": "Password should be at least 6 characters long"}

        query = user_collection.where("username", "==", username)

        docs = query.stream()

        if any(docs):
            return {"error": "Username already exists"}

        otp = random.randint(100000, 999999)

        session["signup-otp"] = otp

        # send email with otp
        try:
            send_signup_otp_email(email, otp)
            print(f"OTP sent to {email}")
            return {"message": "OTP sent"}

        except Exception as e:
            print(f"Failed to send OTP to {email}: {e}")
            return {"error": "Failed to send OTP"}

    else:
        return {"error": "No data received"}


@app.route("/signup_otp_verify", methods=["POST"])
def signup_otp_verify():
    print("signup_otp_verify")
    data = request.get_json()
    if data:
        otp = data.get("otp")
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not otp:
            return {"error": "Missing fields"}

        if "signup-otp" in session and session["signup-otp"] == int(otp):
            docs = user_collection.stream()
            count = sum(1 for doc in docs)
            id = count + 1

            hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

            data = {
                "id": id,
                "username": username,
                "email": email,
                "password": hashed_password.decode("utf-8"),
            }

            doc_ref = user_collection.add(data)

            return {"message": "Signup successful"}
        else:
            return {"error": "Invalid OTP"}
    else:
        return {"error": "No data received"}


@app.route("/send-otp-reset-password", methods=["POST"])
def send_otp_reset_password():
    data = request.get_json()
    if data:
        email = data.get("email")
        if not email:
            return {"error": "Missing fields"}

        if not isValidEmail(email):
            return {"error": "Invalid email"}

        query = user_collection.where("email", "==", email)

        docs = list(query.stream())

        if any(docs):
            otp = random.randint(100000, 999999)
            session["reset-pass-otp"] = otp
            session["email"] = email
            # send email with otp
            try:
                send_otp_email(email, otp)
                print(f"OTP sent to {email}")
                return {"message": "OTP sent"}
            except Exception as e:
                print(f"Failed to send OTP to {email}: {e}")
            return {"message": "OTP sent"}
        else:
            return {"error": "Email not found"}
    else:
        return {"error": "No data received"}


@app.route("/verify-otp-reset-password", methods=["POST"])
def verify_otp_reset_password():
    data = request.get_json()
    if data:
        otp = data.get("otp")
        if not otp:
            return {"error": "Missing fields"}

        if "reset-pass-otp" in session and session["reset-pass-otp"] == int(otp):
            return {"message": "OTP verified"}
        else:
            return {"error": "Invalid OTP"}
    else:
        return {"error": "No data received"}


@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    if data:
        password = data.get("password")
        if not password:
            return {"error": "Missing fields"}

        if len(password) < 6:
            return {"error": "Password should be at least 6 characters long"}

        email = session.get("email")
        if not email:
            return {"error": "Email not found in session"}

        query = user_collection.where("email", "==", email)
        docs = list(query.stream())

        if any(docs):
            for doc in docs:
                doc_dict = doc.to_dict()
                hashed_password = bcrypt.hashpw(
                    password.encode("utf-8"), bcrypt.gensalt()
                )
                user_collection.document(doc.id).update(
                    {"password": hashed_password.decode("utf-8")}
                )

            return {"message": "Password reset successful"}
        else:
            return {"error": "Email not found in database"}
    else:
        return {"error": "No data received"}


@app.route("/stock_recommendation_by_data", methods=["POST"])
@login_required
def stock_recommendation_by_data():
    data = request.get_json()
    if data:
        experience = data.get("experience")
        time_horizon = data.get("timeHorizon")
        income_level = data.get("incomeLevel")
        investment_strategy = data.get("investmentStrategy")
        risk_factor = data.get("riskFactor")

        stock_data = f"Experience: {experience}, Time Horizon: {time_horizon}, Income Level: {income_level}, Investment Strategy: {investment_strategy}, Risk Factor: {risk_factor}"

        print(stock_data)

        # Set up the model
    generation_config = {
        "temperature": 0.9,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 2048,
    }

    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
    ]

    model = genai.GenerativeModel(
        model_name="gemini-pro",
        generation_config=generation_config,
        safety_settings=safety_settings,
    )

    context = "You are a bot that will take user data as input and return stock recommendations based on the given data. You will answer in plain text only. Reply with the stock recommendations based on the user data provided. If you are unable to provide recommendations, reply with 'I am unable'."
    response = model.generate_content(context+stock_data)
    
    response = response.text

    print(response)
    return {"response": response}

@app.route("/ai_learning_chat_reset", methods=["POST"])
@login_required
def ai_learning_chat_reset():
    user_id = current_user.id
    ai_learning_chat_messages[user_id] = []
    return {"message": "Chat reset"}


@app.route("/ai_learning_chat", methods=["POST"])
@login_required
def ai_learning_chat():
    user_id = current_user.id

    # Check if the user's chat history exists, if not, initialize it
    if ai_learning_chat_messages.get(user_id) is None:
        ai_learning_chat_messages[user_id] = [
            {
                "role": "system",
                "content": 'You are a bot that will teach users core concepts for stock investing and financial analysis. You will answer in plain text only. Reply to questions not related to given topics by saying "I can only answer questions related to stock investing and financial analysis."',
            },
        ]

    data = request.get_json()
    if data:
        message = data.get("message")
        if message:
            # Append the user's message to their chat history
            ai_learning_chat_messages[user_id].append(
                {"role": "user", "content": message}
            )

            # Simulate AI response (replace this with actual AI response logic)
            ai_response = (
                gptclient.chat.completions.create(
                    model="gpt-4o",
                    messages=ai_learning_chat_messages[user_id],
                )
                .choices[0]
                .message.content
            )

            ai_learning_chat_messages[user_id].append(
                {"role": "system", "content": ai_response}
            )

            return jsonify({"message": ai_response})
        else:
            return jsonify({"error": "No message provided"}), 400
    else:
        return jsonify({"error": "No data received"}), 400


@app.route("/get_stock_ticker", methods=["POST"])
@login_required
def get_stock_ticker():
    data = request.get_json()
    if data:
        company_name = data.get("company_name")
        if company_name:
            print(company_name)
            completion = gptclient.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": 'You are a bot that will take name of company as input and return only their stock ticker.Use bombay Stock Exchange if the stock is indian. You will answer in plain text only. Reply only with the one-word stock ticker symbol. If the company name is not a publicly traded company or is not in the database, reply with "invalid".',
                    },
                    {
                        "role": "user",
                        "content": company_name,
                    },
                ],
            )
            print(completion.choices[0].message.content)

            return jsonify({"message": completion.choices[0].message.content})


@app.route("/cookie-check", methods=["GET"])
def cookie_check():
    if "cookie_accept" in session:
        return {"cookie": True}
    return {"cookie": False}


@app.route("/cookie-accept", methods=["POST"])
def cookie_accept():
    session["cookie_accept"] = True
    return {"cookie": True}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
