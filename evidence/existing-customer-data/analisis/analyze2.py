import csv, statistics, datetime
from collections import Counter

rows=[]
with open('customers.csv') as f:
    for r in csv.DictReader(f):
        rows.append(r)
def d(s): return datetime.date.fromisoformat(s) if s else None
for r in rows:
    r['signup']=d(r['signup_date']); r['last']=d(r['last_activity_date'])
    r['churn']=d(r['churn_date']) if r['churn_date'] else None
    r['sessions']=int(r['sessions_90d']); r['mrr']=int(r['mrr_eur'])
    r['tot']=int(r['total_revenue_eur']); r['tickets']=int(r['support_tickets_90d'])
def avg(xs): return round(sum(xs)/len(xs),1) if xs else 0

today=datetime.date(2026,10,21)
REF=max(r['last'] for r in rows)
active=[r for r in rows if r['status']=='active']
churned=[r for r in rows if r['status']=='churned']
PLANS=['Starter','Growth','Pro']

print("=== PLAN DETAIL ===")
for p in PLANS:
    g=[r for r in rows if r['plan']==p]
    a=[r for r in g if r['status']=='active']
    c=[r for r in g if r['status']=='churned']
    print(p,"total=",len(g),"active=",len(a),"churned=",len(c),
          "churn%=",round(100*len(c)/len(g),1),
          "avgMRR(active)=",avg([r['mrr'] for r in a]),
          "medianMRR=",statistics.median([r['mrr'] for r in a]) if a else 0,
          "avgTotRev=",avg([r['tot'] for r in g]))

# LTV: active customers -> avg monthly churn rate approach
# Overall monthly churn: churned in window. Use simple: churn count / total over observed, approximate monthly.
# Better: avg lifespan of churned + MRR. Also LTV = MRR / monthly_churn_rate.
# Estimate monthly churn rate per plan from churned lifespan (1/avg_lifespan_months)
print("\n=== LTV (MRR / monthly churn proxy) ===")
for p in PLANS:
    g=[r for r in rows if r['plan']==p]
    a=[r for r in g if r['status']=='active']
    c=[r for r in g if r['status']=='churned' and r['churn']]
    mrr=avg([r['mrr'] for r in a])
    # monthly churn rate proxy = churned / total_customer_months_observed? use churn fraction / avg tenure
    # simpler: observed churn fraction over avg account age in months
    ages=[ (today-r['signup']).days/30.0 for r in g ]
    avg_age=statistics.mean(ages)
    monthly_churn = (len(c)/len(g))/avg_age if avg_age else 0
    ltv = mrr/monthly_churn if monthly_churn else 0
    print(p,"avgMRR=",mrr,"obs_churn%=",round(100*len(c)/len(g),1),
          "avg_acct_age_mo=",round(avg_age,1),
          "implied_monthly_churn%=",round(100*monthly_churn,2),
          "LTV=€",round(ltv))

# RFM style using sessions as frequency, recency days, monetary=total rev (on ACTIVE only for forward segments; include churned as Lost)
print("\n=== RFM INPUTS (active) ===")
rec=[(REF-r['last']).days for r in active]
print("recency days active: median",statistics.median(rec),"p90",sorted(rec)[int(0.9*len(rec))])
print("sessions active: median",statistics.median([r['sessions'] for r in active]),"mean",avg([r['sessions'] for r in active]))
print("total rev active: median",statistics.median([r['tot'] for r in active]),"mean",avg([r['tot'] for r in active]))

# Champions = active, Pro or Growth, high sessions, onboarded, low tickets, tenure>6mo
champ=[r for r in active if r['plan'] in ('Pro','Growth') and r['sessions']>=50 and r['onboarding_completed']=='yes' and (today-r['signup']).days>180]
print("\n=== CHAMPIONS (active, Pro/Growth, sessions>=50, onboarded, tenure>6mo) ===")
print("n=",len(champ),"=",round(100*len(champ)/len(rows),1),"% of all,",round(100*len(champ)/len(active),1),"% of active")
print("avgMRR=",avg([r['mrr'] for r in champ]),"avgTotRev=",avg([r['tot'] for r in champ]),
      "avgSessions=",avg([r['sessions'] for r in champ]),"avgTickets=",avg([r['tickets'] for r in champ]))
print("champ MRR share of active MRR:",round(100*sum(r['mrr'] for r in champ)/sum(r['mrr'] for r in active),1),"%")
print("industry mix:",Counter(r['industry'] for r in champ))
print("size mix:",Counter(r['company_size'] for r in champ))
print("plan mix:",Counter(r['plan'] for r in champ))

# total MRR book
print("\ntotal active MRR €",sum(r['mrr'] for r in active),"/mo")
print("MRR by plan:",{p:sum(r['mrr'] for r in active if r['plan']==p) for p in PLANS})

# At risk: active, onboarded or not, low recent sessions or no onboarding, tickets high
atrisk=[r for r in active if r['sessions']<20 or r['onboarding_completed']=='no' or r['tickets']>=3]
print("\nAt-risk active (sessions<20 OR not onboarded OR tickets>=3): n=",len(atrisk),"=",round(100*len(atrisk)/len(active),1),"% of active")
# New: signup within 90d of today
new=[r for r in active if (today-r['signup']).days<=90]
print("New (<=90d tenure): n=",len(new))
