#!/usr/bin/env python3
"""Genera customers.csv: 400 clientes SINTÉTICOS de un SaaS B2B ficticio.

Los datos son inventados a propósito y llevan dos patrones plantados, para
poder comprobar si la skill los encuentra:

1. Champions: los clientes de Logística en plan Pro son los más recientes,
   frecuentes y de mayor MRR.
2. Churn: casi todos los que se dan de baja no completaron el onboarding y se
   van en los primeros 90 días.

Uso: python3 generar-datos.py > customers.csv   (semilla fija: sale igual siempre)
"""
import csv
import random
import sys
from datetime import date, timedelta

random.seed(1841)
HOY = date(2026, 10, 1)
SECTORES = ["Logística", "Retail", "Salud", "Educación", "Fintech", "Hostelería"]
PLANES = {"Starter": (49, 99), "Growth": (149, 299), "Pro": (399, 899)}
TAMANOS = ["1-10", "11-50", "51-200", "201-500"]

w = csv.writer(sys.stdout)
w.writerow(["customer_id", "email", "company", "industry", "company_size", "plan", "signup_date",
            "last_activity_date", "sessions_90d", "mrr_eur", "total_revenue_eur",
            "onboarding_completed", "support_tickets_90d", "status", "churn_date"])

for i in range(1, 401):
    champion = i <= 60  # patrón 1
    if champion:
        industry, plan, size = "Logística", "Pro", random.choice(["51-200", "201-500"])
        onboarding = True
    else:
        industry = random.choice(SECTORES[1:]) if random.random() < 0.85 else "Logística"
        plan = random.choices(list(PLANES), weights=[5, 4, 1])[0]
        size = random.choice(TAMANOS)
        onboarding = random.random() < 0.6

    signup = HOY - timedelta(days=random.randint(30, 900))
    churned = False
    if not champion:
        # patrón 2: sin onboarding, el churn es mucho más probable y temprano
        churned = random.random() < (0.55 if not onboarding else 0.08)
    if churned:
        vida = random.randint(20, 85) if not onboarding else random.randint(150, 600)
        churn = min(signup + timedelta(days=vida), HOY - timedelta(days=1))
        last = churn - timedelta(days=random.randint(0, 10))
        sessions = random.randint(0, 6)
        tickets = random.randint(2, 7) if not onboarding else random.randint(0, 2)
    else:
        churn = None
        last = HOY - timedelta(days=random.randint(0, 6) if champion else random.randint(0, 120))
        sessions = random.randint(60, 140) if champion else random.randint(3, 70)
        tickets = random.randint(0, 2)

    lo, hi = PLANES[plan]
    mrr = random.randint(lo, hi)
    meses = max(1, ((churn or HOY) - signup).days // 30)
    w.writerow([f"C{i:04d}", f"cliente{i:04d}@example.com", f"Empresa {i:04d} SL", industry, size, plan,
                signup.isoformat(), last.isoformat(), sessions, mrr, mrr * meses,
                "yes" if onboarding else "no", tickets, "churned" if churned else "active",
                churn.isoformat() if churn else ""])
