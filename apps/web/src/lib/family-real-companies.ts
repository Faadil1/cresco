/**
 * Research-only profiles of actual listed companies. Static qualitative
 * descriptions grounded in the issuer's official investor-relations pages.
 * No quote feeds, mock stock prices, transaction methods or child holdings.
 */
export type PublicCompanyResearch = {
  id: "shopify" | "microsoft" | "costco" | "apple";
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  model: string;
  customers: string;
  researchQuestion: string;
  risksToConsider: string[];
  officialSource: string;
  sourceLabel: string;
};

export const REAL_COMPANY_RESEARCH: readonly PublicCompanyResearch[] = [
  {
    id: "shopify",
    name: "Shopify",
    ticker: "SHOP",
    exchange: "NYSE / TSX",
    sector: "Commerce software",
    model: "Offers a commerce platform and tools that help merchants start and operate businesses.",
    customers: "Merchants and businesses selling in stores and online.",
    researchQuestion: "How do merchant activity, competition and platform expenses affect the business?",
    risksToConsider: ["Merchants may see changing demand", "Competition for online commerce tools", "Product and infrastructure spending"],
    officialSource: "https://www.shopify.com/investors",
    sourceLabel: "Shopify Investor Relations",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    ticker: "MSFT",
    exchange: "NASDAQ",
    sector: "Cloud and software",
    model: "Provides software, cloud services, business applications, devices and other technology services.",
    customers: "Individuals, businesses, developers and organizations.",
    researchQuestion: "Where does recurring revenue come from, and what does competing in cloud and AI cost?",
    risksToConsider: ["Competition across technology markets", "Infrastructure and development costs", "Security and regulation"],
    officialSource: "https://www.microsoft.com/en-us/Investor",
    sourceLabel: "Microsoft Investor Relations",
  },
  {
    id: "costco",
    name: "Costco",
    ticker: "COST",
    exchange: "NASDAQ",
    sector: "Membership retail",
    model: "Operates membership warehouses and e-commerce sites with high sales volume and low-price merchandise.",
    customers: "Members shopping for household goods and a wide range of products.",
    researchQuestion: "Why do memberships, buying in bulk and operating expenses matter to Costco's model?",
    risksToConsider: ["Labor and supply-chain expenses", "Membership retention", "Retail competition"],
    officialSource: "https://investor.costco.com/overview/",
    sourceLabel: "Costco Investor Relations",
  },
  {
    id: "apple",
    name: "Apple",
    ticker: "AAPL",
    exchange: "NASDAQ",
    sector: "Devices and services",
    model: "Designs and markets consumer devices and related digital services.",
    customers: "Consumers, businesses and organizations using Apple devices and services.",
    researchQuestion: "How do devices, services, product demand and supply chains contribute to the business?",
    risksToConsider: ["Competition in devices and services", "Global supply-chain exposure", "Product cycles and changing demand"],
    officialSource: "https://investor.apple.com/investor-relations/",
    sourceLabel: "Apple Investor Relations",
  },
];
