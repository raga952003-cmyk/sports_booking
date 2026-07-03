#!/usr/bin/env python3
"""
Test Email Configuration Script
Sends a test email to verify SMTP setup
"""

from email_service import test_email_configuration, ENABLE_REAL_EMAILS, SMTP_USER

print("=" * 60)
print("TCS PlaySmart - Email Configuration Test")
print("=" * 60)

if not ENABLE_REAL_EMAILS:
    print("\n❌ Real emails are DISABLED")
    print("   To enable, set ENABLE_REAL_EMAILS=true in .env")
    exit(1)

print(f"\n✓ Real emails ENABLED")
print(f"✓ SMTP User: {SMTP_USER}")

print("\n" + "-" * 60)
print("Sending test email...")
print("-" * 60)

result = test_email_configuration()

if result["success"]:
    print("\n✅ SUCCESS! Test email sent.")
    print(result["message"])
    print(f"\nCheck your inbox at: {SMTP_USER}")
else:
    print("\n❌ FAILED to send test email.")
    print(f"Error: {result['error']}")
    print("\nTroubleshooting:")
    print("1. Check SMTP_USER and SMTP_PASSWORD in .env")
    print("2. Make sure you're using Gmail App Password (16 chars)")
    print("3. Verify 2-Step Verification is enabled on your Google account")
    print("4. Check firewall isn't blocking port 587")

print("\n" + "=" * 60)
