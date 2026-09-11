export type SalesOrder = {
  date: string;
  region: string;
  category: string;
  product: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
};

export const salesOrders: SalesOrder[] = [
  { date: '2025-01-06', region: 'West', category: 'Technology', product: 'Wireless Headset', sales: 1250, quantity: 5, discount: 0.05, profit: 210 },
  { date: '2025-01-14', region: 'Central', category: 'Technology', product: 'USB-C Dock', sales: 1840, quantity: 4, discount: 0.10, profit: 265 },
  { date: '2025-01-25', region: 'East', category: 'Office Supplies', product: 'Planner Set', sales: 980, quantity: 12, discount: 0, profit: 188 },
  { date: '2025-02-03', region: 'South', category: 'Technology', product: 'Office Monitor', sales: 2150, quantity: 3, discount: 0.15, profit: 170 },
  { date: '2025-02-11', region: 'West', category: 'Office Supplies', product: 'Archive Box Pack', sales: 1420, quantity: 18, discount: 0.05, profit: 240 },
  { date: '2025-02-21', region: 'Central', category: 'Furniture', product: 'Task Chair', sales: 1120, quantity: 4, discount: 0.10, profit: 125 },
  { date: '2025-03-04', region: 'East', category: 'Technology', product: 'Mechanical Keyboard', sales: 1560, quantity: 8, discount: 0.05, profit: 278 },
  { date: '2025-03-12', region: 'South', category: 'Furniture', product: 'Standing Desk', sales: 2380, quantity: 4, discount: 0.10, profit: 312 },
  { date: '2025-03-27', region: 'West', category: 'Office Supplies', product: 'Label Printer', sales: 890, quantity: 6, discount: 0.20, profit: -42 },
  { date: '2025-04-02', region: 'Central', category: 'Office Supplies', product: 'Notebook Bundle', sales: 760, quantity: 20, discount: 0, profit: 204 },
  { date: '2025-04-16', region: 'East', category: 'Technology', product: 'Web Camera', sales: 1320, quantity: 8, discount: 0.10, profit: 176 },
  { date: '2025-04-26', region: 'South', category: 'Furniture', product: 'Bookcase', sales: 980, quantity: 5, discount: 0.25, profit: -65 },
  { date: '2025-05-05', region: 'West', category: 'Technology', product: 'External SSD', sales: 1780, quantity: 7, discount: 0.05, profit: 295 },
  { date: '2025-05-13', region: 'Central', category: 'Office Supplies', product: 'Desk Organizer', sales: 540, quantity: 14, discount: 0, profit: 142 },
  { date: '2025-05-29', region: 'East', category: 'Furniture', product: 'Meeting Table', sales: 2640, quantity: 3, discount: 0.15, profit: 230 },
  { date: '2025-06-07', region: 'South', category: 'Technology', product: 'Network Switch', sales: 1960, quantity: 7, discount: 0.10, profit: 254 },
  { date: '2025-06-15', region: 'West', category: 'Office Supplies', product: 'Ink Cartridge Pack', sales: 680, quantity: 16, discount: 0.05, profit: 128 },
  { date: '2025-06-24', region: 'Central', category: 'Furniture', product: 'Ergonomic Chair', sales: 1490, quantity: 5, discount: 0.20, profit: 72 },
  { date: '2025-07-03', region: 'East', category: 'Technology', product: 'Wireless Headset', sales: 1680, quantity: 7, discount: 0.05, profit: 301 },
  { date: '2025-07-11', region: 'South', category: 'Office Supplies', product: 'Shipping Labels', sales: 470, quantity: 18, discount: 0, profit: 119 },
  { date: '2025-07-26', region: 'West', category: 'Furniture', product: 'Filing Cabinet', sales: 1210, quantity: 4, discount: 0.15, profit: 88 },
  { date: '2025-08-04', region: 'Central', category: 'Technology', product: 'Office Monitor', sales: 2420, quantity: 4, discount: 0.10, profit: 318 },
  { date: '2025-08-18', region: 'East', category: 'Office Supplies', product: 'Archive Box Pack', sales: 1290, quantity: 16, discount: 0.05, profit: 219 },
  { date: '2025-08-27', region: 'South', category: 'Furniture', product: 'Conference Chair', sales: 2050, quantity: 8, discount: 0.25, profit: -120 },
  { date: '2025-09-06', region: 'West', category: 'Technology', product: 'USB-C Dock', sales: 2210, quantity: 5, discount: 0.10, profit: 327 },
  { date: '2025-09-14', region: 'Central', category: 'Office Supplies', product: 'Planner Set', sales: 840, quantity: 10, discount: 0, profit: 176 },
  { date: '2025-09-23', region: 'East', category: 'Furniture', product: 'Standing Desk', sales: 2740, quantity: 5, discount: 0.10, profit: 386 },
  { date: '2025-10-02', region: 'South', category: 'Technology', product: 'External SSD', sales: 1890, quantity: 8, discount: 0.05, profit: 305 },
  { date: '2025-10-12', region: 'West', category: 'Office Supplies', product: 'Notebook Bundle', sales: 620, quantity: 17, discount: 0, profit: 165 },
  { date: '2025-10-28', region: 'Central', category: 'Furniture', product: 'Task Chair', sales: 1340, quantity: 6, discount: 0.20, profit: 54 },
  { date: '2025-11-05', region: 'East', category: 'Technology', product: 'Network Switch', sales: 2160, quantity: 6, discount: 0.10, profit: 284 },
  { date: '2025-11-16', region: 'South', category: 'Office Supplies', product: 'Label Printer', sales: 930, quantity: 7, discount: 0.20, profit: -31 },
  { date: '2025-11-25', region: 'West', category: 'Furniture', product: 'Bookcase', sales: 1180, quantity: 6, discount: 0.15, profit: 64 },
  { date: '2025-12-04', region: 'Central', category: 'Technology', product: 'Web Camera', sales: 1540, quantity: 10, discount: 0.05, profit: 248 },
  { date: '2025-12-15', region: 'East', category: 'Office Supplies', product: 'Desk Organizer', sales: 690, quantity: 19, discount: 0, profit: 182 },
  { date: '2025-12-22', region: 'South', category: 'Furniture', product: 'Meeting Table', sales: 2980, quantity: 4, discount: 0.10, profit: 352 },
];
