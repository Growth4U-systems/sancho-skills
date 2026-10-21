#!/usr/bin/env python3
"""Comprueba el informe de existing-customer-data contra lo plantado en customers.csv.

No juzga la calidad de la prosa: solo mira hechos que se pueden contar.
Uso: python3 verificar.py informe.md [--json]   (código 1 si alguna comprobación falla)
"""
import json
import re
import sys

ruta = sys.argv[1]
texto = open(ruta, encoding="utf-8").read()
bajo = texto.lower()


def secciones(patron):
    """Texto de las secciones cuyo título casa con el patrón (hasta el siguiente título de igual o mayor nivel)."""
    out = []
    lineas = texto.split("\n")
    for i, l in enumerate(lineas):
        m = re.match(r"^(#+)\s+(.*)", l)
        if m and re.search(patron, m.group(2), re.I):
            nivel = len(m.group(1))
            cuerpo = []
            for l2 in lineas[i + 1:]:
                m2 = re.match(r"^(#+)\s", l2)
                if m2 and len(m2.group(1)) <= nivel:
                    break
                cuerpo.append(l2)
            out.append("\n".join(cuerpo).lower())
    return "\n".join(out)


champ = secciones(r"champion|mejores clientes|best customer")
churn = secciones(r"churn|abandono|bajas")
emails = re.findall(r"[\w.+-]+@[\w-]+\.[\w.]+", texto)

checks = [
    ("Privacidad: ningún email de cliente en el informe", not emails, f"{len(emails)} emails"),
    ("Champions: identifica Logística", bool(re.search(r"log[ií]stica", champ)), "sección Champions"),
    ("Champions: identifica el plan Pro", bool(re.search(r"\bpro\b", champ)), "sección Champions"),
    ("Churn: lo liga al onboarding no completado", "onboarding" in churn, "sección churn"),
    ("Churn: señala que ocurre en los primeros ~90 días",
     bool(re.search(r"\b(90|60|3 meses|tres meses|primer trimestre)\b", churn)), "sección churn"),
    ("Cifras: usa el total real de 400 clientes", bool(re.search(r"\b400\b", texto)), "texto completo"),
    ("Cifras: usa el total real de 95 bajas", bool(re.search(r"\b95\b", texto)), "texto completo"),
    ("Self-QA: incluye la marca que exige la skill", "self-qa" in bajo, "texto completo"),
]

ok = all(c[1] for c in checks)
if "--json" in sys.argv:
    print(json.dumps({"informe": ruta, "pasa": ok,
                      "comprobaciones": [{"prueba": c[0], "pasa": c[1], "donde": c[2]} for c in checks]},
                     ensure_ascii=False, indent=2))
else:
    for nombre, paso, donde in checks:
        print(f"{'PASA' if paso else 'FALLA'}  {nombre}  ({donde})")
    print("\nRESULTADO:", "PASA" if ok else "NO PASA")
sys.exit(0 if ok else 1)
