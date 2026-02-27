


// All 58 Algerian Wilayas
export const ALGERIAN_WILAYAS = [
  { code: '01', name: 'Adrar' },
  { code: '02', name: 'Chlef' },
  { code: '03', name: 'Laghouat' },
  { code: '04', name: 'Oum El Bouaghi' },
  { code: '05', name: 'Batna' },
  { code: '06', name: 'Béjaïa' },
  { code: '07', name: 'Biskra' },
  { code: '08', name: 'Béchar' },
  { code: '09', name: 'Blida' },
  { code: '10', name: 'Bouira' },
  { code: '11', name: 'Tamanrasset' },
  { code: '12', name: 'Tébessa' },
  { code: '13', name: 'Tlemcen' },
  { code: '14', name: 'Tiaret' },
  { code: '15', name: 'Tizi Ouzou' },
  { code: '16', name: 'Alger' },
  { code: '17', name: 'Djelfa' },
  { code: '18', name: 'Jijel' },
  { code: '19', name: 'Sétif' },
  { code: '20', name: 'Saïda' },
  { code: '21', name: 'Skikda' },
  { code: '22', name: 'Sidi Bel Abbès' },
  { code: '23', name: 'Annaba' },
  { code: '24', name: 'Guelma' },
  { code: '25', name: 'Constantine' },
  { code: '26', name: 'Médéa' },
  { code: '27', name: 'Mostaganem' },
  { code: '28', name: "M'Sila" },
  { code: '29', name: 'Mascara' },
  { code: '30', name: 'Ouargla' },
  { code: '31', name: 'Oran' },
  { code: '32', name: 'El Bayadh' },
  { code: '33', name: 'Illizi' },
  { code: '34', name: 'Bordj Bou Arréridj' },
  { code: '35', name: 'Boumerdès' },
  { code: '36', name: 'El Tarf' },
  { code: '37', name: 'Tindouf' },
  { code: '38', name: 'Tissemsilt' },
  { code: '39', name: 'El Oued' },
  { code: '40', name: 'Khenchela' },
  { code: '41', name: 'Souk Ahras' },
  { code: '42', name: 'Tipaza' },
  { code: '43', name: 'Mila' },
  { code: '44', name: 'Aïn Defla' },
  { code: '45', name: 'Naâma' },
  { code: '46', name: 'Aïn Témouchent' },
  { code: '47', name: 'Ghardaïa' },
  { code: '48', name: 'Relizane' },
  { code: '49', name: 'Timimoun' },
  { code: '50', name: 'Bordj Badji Mokhtar' },
  { code: '51', name: 'Ouled Djellal' },
  { code: '52', name: 'Béni Abbès' },
  { code: '53', name: 'In Salah' },
  { code: '54', name: 'In Guezzam' },
  { code: '55', name: 'Touggourt' },
  { code: '56', name: 'Djanet' },
  { code: '57', name: "El M'Ghair" },
  { code: '58', name: 'El Meniaa' },
];

enum OrderStatus {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  SHIPPED = "SHIPPED",
  IN_TRANSIT = "IN_TRANSIT",
  AT_OFFICE = "AT_OFFICE",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
  RETURNED = "RETURNED",
}


export enum OrderStatusNoest {
  PENDING = 'pending',
  VALIDATED = 'validated',
  PICKED_UP = 'picked_up',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}


export const COLORS = [
  { name: "Red", value: "red", hex: "#ef4444" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Green", value: "green", hex: "#22c55e" },
  { name: "Black", value: "black", hex: "#000000" },
  { name: "White", value: "white", hex: "#ffffff" },
  { name: "Yellow", value: "yellow", hex: "#eab308" },
  { name: "Purple", value: "purple", hex: "#a855f7" },
  { name: "Pink", value: "pink", hex: "#ec4899" },
  { name: "Orange", value: "orange", hex: "#f97316" },
  { name: "Gray", value: "gray", hex: "#6b7280" },
  { name: "Brown", value: "brown", hex: "#92400e" },
  { name: "Beige", value: "beige", hex: "#f5f5dc" },
  { name: "Navy", value: "navy", hex: "#1e3a8a" },
  { name: "Teal", value: "teal", hex: "#0d9488" },
];


export const PERMISSIONS = {
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_CUSTOMERS: 'manage_customers',
  MANAGE_EMPLOYEES: 'manage_employees',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_INVENTORY: 'view_inventory',
  VIEW_FINANCES: 'view_finances',
  MANAGE_DISCOUNTS: 'manage_discounts',
  CONFIRM_ORDERS: 'confirm_orders',
  UPDATE_ORDER_STATUS: 'update_order_status',
} as const;

export const PERMISSION_OPTIONS = Object.values(PERMISSIONS).map(value => ({
  key: value,
  label: value
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' '),
}));


export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return "#6c757d";       // gray
    case OrderStatus.PREPARING:
      return "#17a2b8";       // blue
    case OrderStatus.SHIPPED:
      return "#007bff";       // primary blue
    case OrderStatus.IN_TRANSIT:
      return "#6610f2";       // purple
    case OrderStatus.AT_OFFICE:
      return "#fd7e14";       // orange
    case OrderStatus.OUT_FOR_DELIVERY:
      return "#ffc107";       // yellow
    case OrderStatus.DELIVERED:
      return "#28a745";       // green
    case OrderStatus.CANCELED:
      return "#dc3545";       // red
    case OrderStatus.RETURNED:
      return "#343a40";       // dark gray
    default:
      return "#6c757d";
  }
}

export async function getAgencyStatus(trackingId: string): Promise<string> {
  // TODO: Replace with real delivery agency API
  return "DELIVERED";
}

export function mapNoestStatusToOrderStatus(
  noestStatus: OrderStatusNoest
): OrderStatus | null {
  switch (noestStatus) {
    case OrderStatusNoest.PENDING:
      return OrderStatus.PENDING;

    case OrderStatusNoest.VALIDATED:
      return OrderStatus.PREPARING;

    case OrderStatusNoest.PICKED_UP:
      return OrderStatus.SHIPPED;

    case OrderStatusNoest.OUT_FOR_DELIVERY:
      return OrderStatus.OUT_FOR_DELIVERY;

    case OrderStatusNoest.DELIVERED:
      return OrderStatus.DELIVERED;

    case OrderStatusNoest.RETURNED:
      return OrderStatus.RETURNED;

    case OrderStatusNoest.SUSPENDED:
      return OrderStatus.AT_OFFICE;

    case OrderStatusNoest.CANCELLED:
      return OrderStatus.CANCELED;

    default:
      return null;
  }
}
