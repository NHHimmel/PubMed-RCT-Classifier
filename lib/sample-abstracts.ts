import { SampleAbstract } from './types';

export const SAMPLE_ABSTRACTS: SampleAbstract[] = [
  {
    id: 'sample-diabetes',
    title: 'GLP-1 Receptor Agonist in Type 2 Diabetes',
    category: 'Endocrinology / RCT',
    journal: 'New England Journal of Medicine',
    rawText: `Type 2 diabetes is associated with an increased risk of cardiovascular disease and premature death. We investigated the cardiovascular safety and efficacy of once-weekly semaglutide in patients with type 2 diabetes. In this double-blind, randomized, placebo-controlled trial, we assigned patients with type 2 diabetes at high cardiovascular risk to receive once-weekly subcutaneous semaglutide (0.5 mg or 1.0 mg) or placebo for 104 weeks. The primary composite outcome was the first occurrence of death from cardiovascular causes, nonfatal myocardial infarction, or nonfatal stroke. A total of 3297 patients were randomized and followed for a median duration of 2.1 years. The primary outcome occurred in 108 of 1648 patients (6.6%) in the semaglutide group and in 146 of 1649 patients (8.9%) in the placebo group (hazard ratio, 0.74; 95% CI, 0.58 to 0.95; P<0.001 for noninferiority; P=0.02 for superiority). Rates of death from cardiovascular causes were similar in both groups. In patients with type 2 diabetes at high cardiovascular risk, the rate of first occurrence of death from cardiovascular causes, nonfatal myocardial infarction, or nonfatal stroke was significantly lower among those receiving semaglutide than among those receiving placebo.`
  },
  {
    id: 'sample-oncology',
    title: 'Immunotherapy with Pembrolizumab in Advanced NSCLC',
    category: 'Oncology / Phase 3 RCT',
    journal: 'The Lancet Oncology',
    rawText: `Pembrolizumab has shown promising antitumor activity in patients with pretreated non-small-cell lung cancer (NSCLC). We aimed to evaluate the overall survival benefit of pembrolizumab versus docetaxel in patients with previously treated PD-L1-positive advanced NSCLC. We conducted a randomized, open-label, international, phase 2/3 study at 202 academic medical centers in 24 countries. Patients were randomly assigned (1:1:1) to receive pembrolizumab 2 mg/kg, pembrolizumab 10 mg/kg, or docetaxel 75 mg/m2 every 3 weeks. Overall survival was significantly longer with pembrolizumab 2 mg/kg than with docetaxel (median 10.4 months vs 8.5 months; hazard ratio 0.71, 95% CI 0.58-0.88; p=0.0008). Grade 3 to 5 treatment-related adverse events were less common with pembrolizumab than with docetaxel (13% vs 35%). Pembrolizumab prolongs overall survival and has a favorable safety profile compared with standard docetaxel chemotherapy in patients with advanced NSCLC.`
  },
  {
    id: 'sample-cardio',
    title: 'Dual Antiplatelet Therapy after Coronary Stenting',
    category: 'Cardiology / Multicenter RCT',
    journal: 'JAMA Cardiology',
    rawText: `The optimal duration of dual antiplatelet therapy after drug-eluting stent implantation remains controversial. This randomized clinical trial sought to compare clinical outcomes of 3-month versus 12-month dual antiplatelet therapy. We randomly assigned 3,045 patients undergoing percutaneous coronary intervention across 23 hospitals to receive either 3 months or 12 months of aspirin plus clopidogrel. The primary end point was a composite of cardiac death, myocardial infarction, or definite stent thrombosis at 12 months. The primary end point occurred in 31 patients (2.0%) in the 3-month group and in 29 patients (1.9%) in the 12-month group (hazard ratio, 1.07; 95% CI, 0.65 to 1.77; P=0.01 for noninferiority). Major bleeding complications were reduced significantly in the short-duration group (0.7% vs 1.6%, P=0.02). Three-month dual antiplatelet therapy was noninferior to standard 12-month therapy for ischemic events while significantly reducing major bleeding risk.`
  }
];
