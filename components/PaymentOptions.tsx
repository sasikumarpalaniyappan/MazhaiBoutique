"use client";

import React from "react";

type CardInfo = {
  cardNumber: string;
  name: string;
  expiry: string;
  cvv: string;
};

type Props = {
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
  cardInfo: CardInfo;
  setCardInfo: (c: CardInfo) => void;
};

export default function PaymentOptions({ paymentMethod, setPaymentMethod, cardInfo, setCardInfo, }: Props) {
  return (
    <div className="mt-4">
      <h3 className="text-md font-semibold text-gray-800 mb-3">Payment</h3>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={() => setPaymentMethod("cod")}
            className="form-radio text-rose-600"
          />
          <span className="text-sm">Cash on Delivery</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="radio"
            name="payment"
            value="card"
            checked={paymentMethod === "card"}
            onChange={() => setPaymentMethod("card")}
            className="form-radio text-rose-600"
          />
          <span className="text-sm">Credit / Debit Card</span>
        </label>

        {paymentMethod === "card" && (
          <div className="mt-3 space-y-3">
            <input
              type="text"
              name="cardNumber"
              placeholder="Card number"
              value={cardInfo.cardNumber}
              onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
              className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none"
            />
            <input
              type="text"
              name="name"
              placeholder="Name on card"
              value={cardInfo.name}
              onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
              className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
                value={cardInfo.expiry}
                onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none"
              />
              <input
                type="password"
                name="cvv"
                placeholder="CVV"
                value={cardInfo.cvv}
                onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-600 outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
