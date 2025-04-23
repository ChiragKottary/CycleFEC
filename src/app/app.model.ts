export interface IOrderItem {
    orderItemId: string;
    orderId: string;
    cycleId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    order?: IOrder;
    cycle?: ICycle;
}

export interface IStockMovement {
    movementId: string;
    cycleId: string;
    quantity: number;
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
    referenceId?: string;
    userId: string;
    notes: string;
    movementDate: Date;
    updatedAt: Date;
    cycle?: ICycle;
    user?: IUser;
}

export interface IUser {
    userId: string;
    username: string;
    passwordHash: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    role?: IRole;
}

export interface IRole {
    roleId: string;
    roleName: string;
    users?: IUser[];
}

export interface ICycleType {
    typeId: string;
    typeName: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrder {
    orderId: string;
    customerId: string;
    orderNumber: string;
    status: string; // You might want to create an enum for OrderStatus
    totalAmount: number;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingPostalCode: string;
    notes?: string;
    processedByUserId?: string;
    orderDate: Date;
    processedDate?: Date;
    shippedDate?: Date;
    deliveredDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    customer?: ICustomer;
    processedByUser?: IUser;
    orderItems?: IOrderItem[];
}

export interface ICartActivityLog {
    logId: string;
    cartId: string;
    customerId: string;
    cycleId?: string;
    userId?: string;
    action: string;
    quantity?: number;
    previousQuantity?: number;
    ipAddress: string;
    notes: string;
    createdAt: Date;
    cart?: ICart;
    customer?: ICustomer;
    cycle?: ICycle;
    user?: IUser;
}

export interface ICycle {
    cycleId: string;
    modelName: string;
    brandId: string;
    typeId: string;
    description: string;
    price: number;
    costPrice: number;
    stockQuantity: number;
    reorderLevel: number;
    imageUrl: string;
    isActive: boolean;
    warrantyMonths: number;
    createdAt: Date;
    updatedAt: Date;
    brand?: IBrand;
    cycleType?: ICycleType;
    cartItems?: ICartItem[];
    orderItems?: IOrderItem[];
    stockMovements?: IStockMovement[];
}

export interface ICartItem {
    cartItemId: string;
    cartId: string;
    cycleId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    addedAt: Date;
    updatedAt: Date;
    cart?: ICart;
    cycle?: ICycle;
}

export interface ICustomer {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    registrationDate: Date;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    lastLoginDate?: Date;
    preferredLanguage?: string;
    marketingPreferences?: string;
    referralSource?: string;
    passwordHash?: string;
    carts?: ICart[];
    orders?: IOrder[];
}

export interface ICart {
    cartId: string;
    customerId: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    sessionId: string;
    notes: string;
    lastAccessedByUserId?: string;
    lastAccessedAt?: Date;
    customer?: ICustomer;
    lastAccessedByUser?: IUser;
    cartItems?: ICartItem[];
}

export interface IBrand {
    brandId: string;
    brandName: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    cycles?: ICycle[];
}