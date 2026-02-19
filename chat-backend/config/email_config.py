from fastapi_mail import ConnectionConfig

EMAIL_USERNAME = "demo.sender@gmail.com"
EMAIL_PASSWORD = "demoapppassword123"
EMAIL_FROM = "demo.sender@gmail.com"

mail_config = ConnectionConfig(
    MAIL_USERNAME="chatbotproject36@gmail.com",
    MAIL_PASSWORD="zuxbgbzeoizvkbnc",
    MAIL_FROM="chatbotproject36@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)
