'use client';

import { useState, useEffect } from 'react';
import { Order, OrderItem, CraftWork, OrderStatus, PaymentMethod } from '@/types';
import { getOrders, addOrder, updateOrder, deleteOrder, getCraftWorks } from '@/lib/storage';
import { formatCurrency, formatDateTime, calculateOrderTotal, calculateFinalAmount } from '@/lib/calculator';

const ORDER_STATUSES: OrderStatus[] = ['待付款', '已付款', '制作中', '已完成', '已发货', '已取消'];
const PAYMENT_METHODS: PaymentMethod[] = ['微信', '支付宝', '银行卡', '现金', '其他'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  '待付款': 'bg-yellow-100 text-yellow-800',
  '已付款': 'bg-green-100 text-green-800',
  '制作中': 'bg-blue-100 text-blue-800',
  '已完成': 'bg-purple-100 text-purple-800',
  '已发货': 'bg-indigo-100 text-indigo-800',
  '已取消': 'bg-gray-100 text-gray-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [works, setWorks] = useState<CraftWork[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [searchFilter, setSearchFilter] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [status, setStatus] = useState<OrderStatus>('待付款');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('微信');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    setOrders(getOrders());
    setWorks(getCraftWorks());
  }, []);

  useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName);
      setCustomerPhone(editingOrder.customerPhone || '');
      setStatus(editingOrder.status);
      setPaymentMethod(editingOrder.paymentMethod || '微信');
      setDiscount(editingOrder.discount?.toString() || '');
      setNotes(editingOrder.notes || '');
      setOrderItems(editingOrder.items);
    } else {
      resetForm();
    }
  }, [editingOrder]);

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setStatus('待付款');
    setPaymentMethod('微信');
    setDiscount('');
    setNotes('');
    setOrderItems([]);
  };

  const handleAddWorkItem = (work: CraftWork) => {
    const existingItem = orderItems.find(item => item.craftWorkId === work.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.craftWorkId === work.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.unitPrice,
            }
          : item
      ));
    } else {
      const price = work.sellingPrice || work.suggestedPrice;
      setOrderItems([
        ...orderItems,
        {
          craftWorkId: work.id,
          craftWorkName: work.name,
          quantity: 1,
          unitPrice: price,
          subtotal: price,
        },
      ]);
    }
  };

  const handleUpdateItemQuantity = (craftWorkId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.craftWorkId !== craftWorkId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.craftWorkId === craftWorkId
          ? { ...item, quantity, subtotal: quantity * item.unitPrice }
          : item
      ));
    }
  };

  const handleSubmit = () => {
    if (!customerName || orderItems.length === 0) return;

    const totalAmount = calculateOrderTotal(orderItems);
    const finalAmount = calculateFinalAmount(totalAmount, discount ? Number(discount) : undefined);

    const orderData = {
      customerName,
      customerPhone: customerPhone || undefined,
      items: orderItems,
      totalAmount,
      discount: discount ? Number(discount) : undefined,
      finalAmount,
      status,
      paymentMethod,
      paidAt: status === '已付款' || status === '已完成' || status === '已发货' ? new Date().toISOString() : undefined,
      deliveredAt: status === '已发货' ? new Date().toISOString() : undefined,
      notes: notes || undefined,
    };

    if (editingOrder) {
      updateOrder(editingOrder.id, orderData);
    } else {
      addOrder(orderData);
    }

    setOrders(getOrders());
    setShowForm(false);
    setEditingOrder(null);
    resetForm();
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowForm(true);
    setViewingOrder(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个订单吗？')) {
      deleteOrder(id);
      setOrders(getOrders());
    }
  };

  const handleView = (order: Order) => {
    setViewingOrder(order);
  };

  const handleUpdateStatus = (order: Order, newStatus: OrderStatus) => {
    const updates: Partial<Order> = { status: newStatus };
    if (newStatus === '已付款' && !order.paidAt) {
      updates.paidAt = new Date().toISOString();
    }
    if (newStatus === '已发货' && !order.deliveredAt) {
      updates.deliveredAt = new Date().toISOString();
    }
    updateOrder(order.id, updates);
    setOrders(getOrders());
  };

  const filteredOrders = orders.filter(order => {
    const matchStatus = !statusFilter || order.status === statusFilter;
    const matchSearch = !searchFilter ||
      order.orderNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchFilter.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== '已取消' ? o.finalAmount : 0), 0);
  const pendingOrders = orders.filter(o => o.status === '待付款' || o.status === '制作中').length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-800">客户订单记录</h2>
          <p className="text-gray-600 mt-1">管理客户订单，跟踪订单状态</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingOrder(null);
          }}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>➕</span>
          <span>新建订单</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold text-amber-600">{orders.length}</div>
          <div className="text-gray-500 text-sm">订单总数</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
          <div className="text-gray-500 text-sm">待处理订单</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          <div className="text-gray-500 text-sm">总营收</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === '已完成').length}
          </div>
          <div className="text-gray-500 text-sm">已完成订单</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="搜索订单号或客户名..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">全部状态</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingOrder ? '编辑订单' : '新建订单'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">客户姓名 *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="请输入客户姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="请输入联系电话"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">支付方式</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优惠金额</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="可选：输入优惠金额"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择作品</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-48 overflow-y-auto">
              {works.map((work) => {
                const selectedItem = orderItems.find(i => i.craftWorkId === work.id);
                return (
                  <div
                    key={work.id}
                    onClick={() => handleAddWorkItem(work)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedItem
                        ? 'border-amber-500 ring-2 ring-amber-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedItem && (
                      <div className="absolute top-1 right-1 bg-amber-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                        {selectedItem.quantity}
                      </div>
                    )}
                    <div className="aspect-square bg-gray-100 flex items-center justify-center text-3xl">
                      🎨
                    </div>
                    <div className="p-1 text-center text-xs bg-white">
                      <p className="truncate">{work.name}</p>
                      <p className="text-amber-600 font-medium">{formatCurrency(work.sellingPrice || work.suggestedPrice)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {orderItems.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">已选作品</h4>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.craftWorkId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{item.craftWorkName}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.unitPrice)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateItemQuantity(item.craftWorkId, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateItemQuantity(item.craftWorkId, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
                      >
                        +
                      </button>
                      <span className="ml-4 font-medium text-amber-600">{formatCurrency(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows={2}
              placeholder="订单备注信息"
            />
          </div>

          {orderItems.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">商品总额</span>
                <span className="font-medium">{formatCurrency(calculateOrderTotal(orderItems))}</span>
              </div>
              {discount && Number(discount) > 0 && (
                <div className="flex justify-between mb-2 text-red-600">
                  <span>优惠</span>
                  <span>-{formatCurrency(Number(discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-amber-200 pt-2">
                <span>应收金额</span>
                <span className="text-amber-600">
                  {formatCurrency(calculateFinalAmount(calculateOrderTotal(orderItems), discount ? Number(discount) : undefined))}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              disabled={!customerName || orderItems.length === 0}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {editingOrder ? '保存修改' : '创建订单'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingOrder(null);
                resetForm();
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">暂无订单记录</h3>
          <p className="text-gray-400">点击上方按钮创建您的第一个订单</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm text-gray-500">{order.orderNo}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      创建于 {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(order)}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => handleEdit(order)}
                      className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">客户：</span>
                    <span className="font-medium text-gray-800">{order.customerName}</span>
                  </div>
                  {order.customerPhone && (
                    <div>
                      <span className="text-gray-500">电话：</span>
                      <span className="text-gray-800">{order.customerPhone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">商品：</span>
                    <span className="text-gray-800">{order.items.reduce((sum, i) => sum + i.quantity, 0)} 件</span>
                  </div>
                  <div>
                    <span className="text-gray-500">金额：</span>
                    <span className="font-bold text-amber-600">{formatCurrency(order.finalAmount)}</span>
                  </div>
                  {order.paymentMethod && (
                    <div>
                      <span className="text-gray-500">支付：</span>
                      <span className="text-gray-800">{order.paymentMethod}</span>
                    </div>
                  )}
                </div>
                {order.status !== '已完成' && order.status !== '已取消' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">更新状态：</p>
                    <div className="flex flex-wrap gap-2">
                      {ORDER_STATUSES.filter(s => s !== order.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdateStatus(order, s)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingOrder && !showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">订单详情</h3>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <span className="font-mono text-sm text-gray-500">{viewingOrder.orderNo}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[viewingOrder.status]}`}>
                  {viewingOrder.status}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">客户姓名</p>
                  <p className="font-medium">{viewingOrder.customerName}</p>
                </div>
                {viewingOrder.customerPhone && (
                  <div>
                    <p className="text-sm text-gray-500">联系电话</p>
                    <p>{viewingOrder.customerPhone}</p>
                  </div>
                )}
                {viewingOrder.paymentMethod && (
                  <div>
                    <p className="text-sm text-gray-500">支付方式</p>
                    <p>{viewingOrder.paymentMethod}</p>
                  </div>
                )}
                {viewingOrder.paidAt && (
                  <div>
                    <p className="text-sm text-gray-500">付款时间</p>
                    <p>{formatDateTime(viewingOrder.paidAt)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">创建时间</p>
                  <p>{formatDateTime(viewingOrder.createdAt)}</p>
                </div>
                {viewingOrder.deliveredAt && (
                  <div>
                    <p className="text-sm text-gray-500">发货时间</p>
                    <p>{formatDateTime(viewingOrder.deliveredAt)}</p>
                  </div>
                )}
              </div>

              <h4 className="font-medium text-gray-800 mb-3">商品明细</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden mb-4">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">作品名称</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">单价</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">数量</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">小计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-sm text-gray-800">{item.craftWorkName}</td>
                        <td className="px-4 py-3 text-center text-sm">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-center text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">商品总额</span>
                  <span className="font-medium">{formatCurrency(viewingOrder.totalAmount)}</span>
                </div>
                {viewingOrder.discount && viewingOrder.discount > 0 && (
                  <div className="flex justify-between mb-2 text-red-600">
                    <span>优惠</span>
                    <span>-{formatCurrency(viewingOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-amber-200 pt-2">
                  <span>应收金额</span>
                  <span className="text-amber-600">{formatCurrency(viewingOrder.finalAmount)}</span>
                </div>
              </div>

              {viewingOrder.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">备注</p>
                  <p className="text-gray-800">{viewingOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
