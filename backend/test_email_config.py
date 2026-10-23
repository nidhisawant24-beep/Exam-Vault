import unittest

from app import create_app


class EmailConfigFallbackTests(unittest.TestCase):
    def test_login_init_returns_dev_otp_when_email_delivery_is_not_configured(self):
        app = create_app()
        app.config.update(MAIL_USERNAME=None, MAIL_PASSWORD=None, SIMULATE_EMAIL_OTP=True)

        with app.test_client() as client:
            response = client.post('/api/auth/login-init', json={
                'email': 'admin@examvault.edu',
                'password': 'Admin@123'
            })

        


if __name__ == '__main__':
    unittest.main()
