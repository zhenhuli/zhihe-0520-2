import { Material, CraftWork, ProcessStep, LaborRecord, CostDetailReport, WorkImage, GalleryAlbum, Customer, Order, PricingHistory, MonthlyStat, CraftTemplate } from '@/types';

const MATERIALS_KEY = 'craftwork_materials';
const CRAFTWORKS_KEY = 'craftwork_works';
const PROCESS_STEPS_KEY = 'craftwork_process_steps';
const LABOR_RECORDS_KEY = 'craftwork_labor_records';
const COST_REPORTS_KEY = 'craftwork_cost_reports';
const WORK_IMAGES_KEY = 'craftwork_work_images';
const GALLERY_ALBUMS_KEY = 'craftwork_gallery_albums';
const CUSTOMERS_KEY = 'craftwork_customers';
const ORDERS_KEY = 'craftwork_orders';
const PRICING_HISTORY_KEY = 'craftwork_pricing_history';
const MONTHLY_STATS_KEY = 'craftwork_monthly_stats';
const CRAFT_TEMPLATES_KEY = 'craftwork_templates';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getMaterials(): Material[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(MATERIALS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMaterials(materials: Material[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
}

export function addMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
  const materials = getMaterials();
  const newMaterial: Material = {
    ...material,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  materials.push(newMaterial);
  saveMaterials(materials);
  return newMaterial;
}

export function updateMaterial(id: string, updates: Partial<Material>): Material | null {
  const materials = getMaterials();
  const index = materials.findIndex(m => m.id === id);
  if (index === -1) return null;
  materials[index] = {
    ...materials[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveMaterials(materials);
  return materials[index];
}

export function deleteMaterial(id: string): boolean {
  const materials = getMaterials();
  const filtered = materials.filter(m => m.id !== id);
  if (filtered.length === materials.length) return false;
  saveMaterials(filtered);
  return true;
}

export function getMaterialById(id: string): Material | undefined {
  const materials = getMaterials();
  return materials.find(m => m.id === id);
}

export function getCraftWorks(): CraftWork[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CRAFTWORKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCraftWorks(works: CraftWork[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CRAFTWORKS_KEY, JSON.stringify(works));
}

export function addCraftWork(work: Omit<CraftWork, 'id' | 'createdAt' | 'updatedAt'>): CraftWork {
  const works = getCraftWorks();
  const newWork: CraftWork = {
    ...work,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  works.push(newWork);
  saveCraftWorks(works);
  return newWork;
}

export function updateCraftWork(id: string, updates: Partial<CraftWork>): CraftWork | null {
  const works = getCraftWorks();
  const index = works.findIndex(w => w.id === id);
  if (index === -1) return null;
  works[index] = {
    ...works[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCraftWorks(works);
  return works[index];
}

export function deleteCraftWork(id: string): boolean {
  const works = getCraftWorks();
  const filtered = works.filter(w => w.id !== id);
  if (filtered.length === works.length) return false;
  saveCraftWorks(filtered);
  return true;
}

export function getCraftWorkById(id: string): CraftWork | undefined {
  const works = getCraftWorks();
  return works.find(w => w.id === id);
}

export function getProcessSteps(): ProcessStep[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PROCESS_STEPS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProcessSteps(steps: ProcessStep[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROCESS_STEPS_KEY, JSON.stringify(steps));
}

export function addProcessStep(step: Omit<ProcessStep, 'id' | 'createdAt' | 'updatedAt'>): ProcessStep {
  const steps = getProcessSteps();
  const newStep: ProcessStep = {
    ...step,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  steps.push(newStep);
  saveProcessSteps(steps);
  return newStep;
}

export function updateProcessStep(id: string, updates: Partial<ProcessStep>): ProcessStep | null {
  const steps = getProcessSteps();
  const index = steps.findIndex(s => s.id === id);
  if (index === -1) return null;
  steps[index] = {
    ...steps[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveProcessSteps(steps);
  return steps[index];
}

export function deleteProcessStep(id: string): boolean {
  const steps = getProcessSteps();
  const filtered = steps.filter(s => s.id !== id);
  if (filtered.length === steps.length) return false;
  saveProcessSteps(filtered);
  return true;
}

export function getProcessStepById(id: string): ProcessStep | undefined {
  const steps = getProcessSteps();
  return steps.find(s => s.id === id);
}

export function getLaborRecords(): LaborRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LABOR_RECORDS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLaborRecords(records: LaborRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LABOR_RECORDS_KEY, JSON.stringify(records));
}

export function addLaborRecord(record: Omit<LaborRecord, 'id' | 'createdAt'>): LaborRecord {
  const records = getLaborRecords();
  const newRecord: LaborRecord = {
    ...record,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  records.push(newRecord);
  saveLaborRecords(records);
  return newRecord;
}

export function updateLaborRecord(id: string, updates: Partial<LaborRecord>): LaborRecord | null {
  const records = getLaborRecords();
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return null;
  records[index] = {
    ...records[index],
    ...updates,
  };
  saveLaborRecords(records);
  return records[index];
}

export function deleteLaborRecord(id: string): boolean {
  const records = getLaborRecords();
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) return false;
  saveLaborRecords(filtered);
  return true;
}

export function getLaborRecordsByCraftWorkId(craftWorkId: string): LaborRecord[] {
  const records = getLaborRecords();
  return records.filter(r => r.craftWorkId === craftWorkId);
}

export function getCostReports(): CostDetailReport[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(COST_REPORTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCostReports(reports: CostDetailReport[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COST_REPORTS_KEY, JSON.stringify(reports));
}

export function addCostReport(report: Omit<CostDetailReport, 'id'>): CostDetailReport {
  const reports = getCostReports();
  const newReport: CostDetailReport = {
    ...report,
    id: generateId(),
  };
  reports.push(newReport);
  saveCostReports(reports);
  return newReport;
}

export function deleteCostReport(id: string): boolean {
  const reports = getCostReports();
  const filtered = reports.filter(r => r.id !== id);
  if (filtered.length === reports.length) return false;
  saveCostReports(filtered);
  return true;
}

export function getCostReportsByCraftWorkId(craftWorkId: string): CostDetailReport[] {
  const reports = getCostReports();
  return reports.filter(r => r.craftWorkId === craftWorkId);
}

export function generateOrderNo(): string {
  const date = new Date();
  const prefix = 'ORD' + date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefix + random;
}

export function getWorkImages(): WorkImage[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(WORK_IMAGES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWorkImages(images: WorkImage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WORK_IMAGES_KEY, JSON.stringify(images));
}

export function addWorkImage(image: Omit<WorkImage, 'id' | 'createdAt'>): WorkImage {
  const images = getWorkImages();
  if (image.isCover) {
    images.forEach(img => {
      if (img.craftWorkId === image.craftWorkId) {
        img.isCover = false;
      }
    });
  }
  const newImage: WorkImage = {
    ...image,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  images.push(newImage);
  saveWorkImages(images);
  return newImage;
}

export function deleteWorkImage(id: string): boolean {
  const images = getWorkImages();
  const filtered = images.filter(img => img.id !== id);
  if (filtered.length === images.length) return false;
  saveWorkImages(filtered);
  return true;
}

export function getWorkImagesByCraftWorkId(craftWorkId: string): WorkImage[] {
  const images = getWorkImages();
  return images.filter(img => img.craftWorkId === craftWorkId);
}

export function setCoverImage(craftWorkId: string, imageId: string): boolean {
  const images = getWorkImages();
  let updated = false;
  images.forEach(img => {
    if (img.craftWorkId === craftWorkId) {
      img.isCover = img.id === imageId;
      if (img.isCover) updated = true;
    }
  });
  if (updated) {
    saveWorkImages(images);
  }
  return updated;
}

export function getGalleryAlbums(): GalleryAlbum[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(GALLERY_ALBUMS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveGalleryAlbums(albums: GalleryAlbum[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GALLERY_ALBUMS_KEY, JSON.stringify(albums));
}

export function addGalleryAlbum(album: Omit<GalleryAlbum, 'id' | 'createdAt' | 'updatedAt'>): GalleryAlbum {
  const albums = getGalleryAlbums();
  const newAlbum: GalleryAlbum = {
    ...album,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  albums.push(newAlbum);
  saveGalleryAlbums(albums);
  return newAlbum;
}

export function updateGalleryAlbum(id: string, updates: Partial<GalleryAlbum>): GalleryAlbum | null {
  const albums = getGalleryAlbums();
  const index = albums.findIndex(a => a.id === id);
  if (index === -1) return null;
  albums[index] = {
    ...albums[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveGalleryAlbums(albums);
  return albums[index];
}

export function deleteGalleryAlbum(id: string): boolean {
  const albums = getGalleryAlbums();
  const filtered = albums.filter(a => a.id !== id);
  if (filtered.length === albums.length) return false;
  saveGalleryAlbums(filtered);
  return true;
}

export function getCustomers(): Customer[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCustomers(customers: Customer[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return null;
  customers[index] = {
    ...customers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCustomers(customers);
  return customers[index];
}

export function deleteCustomer(id: string): boolean {
  const customers = getCustomers();
  const filtered = customers.filter(c => c.id !== id);
  if (filtered.length === customers.length) return false;
  saveCustomers(filtered);
  return true;
}

export function getCustomerById(id: string): Customer | undefined {
  const customers = getCustomers();
  return customers.find(c => c.id === id);
}

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ORDERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function addOrder(order: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: generateId(),
    orderNo: generateOrderNo(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveOrders(orders);
  return orders[index];
}

export function deleteOrder(id: string): boolean {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== id);
  if (filtered.length === orders.length) return false;
  saveOrders(filtered);
  return true;
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find(o => o.id === id);
}

export function getOrdersByCustomerId(customerId: string): Order[] {
  const orders = getOrders();
  return orders.filter(o => o.customerId === customerId);
}

export function getOrdersByStatus(status: string): Order[] {
  const orders = getOrders();
  return orders.filter(o => o.status === status);
}

export function getPricingHistory(): PricingHistory[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PRICING_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePricingHistory(history: PricingHistory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRICING_HISTORY_KEY, JSON.stringify(history));
}

export function addPricingHistory(record: Omit<PricingHistory, 'id' | 'changedAt'>): PricingHistory {
  const history = getPricingHistory();
  const newRecord: PricingHistory = {
    ...record,
    id: generateId(),
    changedAt: new Date().toISOString(),
  };
  history.push(newRecord);
  savePricingHistory(history);
  return newRecord;
}

export function getPricingHistoryByCraftWorkId(craftWorkId: string): PricingHistory[] {
  const history = getPricingHistory();
  return history.filter(h => h.craftWorkId === craftWorkId).sort((a, b) =>
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );
}

export function getMonthlyStats(): MonthlyStat[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(MONTHLY_STATS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMonthlyStats(stats: MonthlyStat[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MONTHLY_STATS_KEY, JSON.stringify(stats));
}

export function addMonthlyStat(stat: Omit<MonthlyStat, 'id' | 'createdAt'>): MonthlyStat {
  const stats = getMonthlyStats();
  const existingIndex = stats.findIndex(s => s.month === stat.month);
  const newStat: MonthlyStat = {
    ...stat,
    id: existingIndex >= 0 ? stats[existingIndex].id : generateId(),
    createdAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    stats[existingIndex] = newStat;
  } else {
    stats.push(newStat);
  }
  saveMonthlyStats(stats);
  return newStat;
}

export function getMonthlyStatByMonth(month: string): MonthlyStat | undefined {
  const stats = getMonthlyStats();
  return stats.find(s => s.month === month);
}

export function getCraftTemplates(): CraftTemplate[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CRAFT_TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCraftTemplates(templates: CraftTemplate[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CRAFT_TEMPLATES_KEY, JSON.stringify(templates));
}

export function addCraftTemplate(template: Omit<CraftTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): CraftTemplate {
  const templates = getCraftTemplates();
  const newTemplate: CraftTemplate = {
    ...template,
    id: generateId(),
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  saveCraftTemplates(templates);
  return newTemplate;
}

export function updateCraftTemplate(id: string, updates: Partial<CraftTemplate>): CraftTemplate | null {
  const templates = getCraftTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return null;
  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCraftTemplates(templates);
  return templates[index];
}

export function deleteCraftTemplate(id: string): boolean {
  const templates = getCraftTemplates();
  const filtered = templates.filter(t => t.id !== id);
  if (filtered.length === templates.length) return false;
  saveCraftTemplates(filtered);
  return true;
}

export function getCraftTemplateById(id: string): CraftTemplate | undefined {
  const templates = getCraftTemplates();
  return templates.find(t => t.id === id);
}

export function incrementTemplateUsage(id: string): void {
  const templates = getCraftTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index !== -1) {
    templates[index].usageCount += 1;
    templates[index].updatedAt = new Date().toISOString();
    saveCraftTemplates(templates);
  }
}
