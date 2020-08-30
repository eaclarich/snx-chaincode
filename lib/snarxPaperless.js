/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");

// predefined order states
const orderStatus = {
  Received: { code: 1, text: "Orden Creada" },
  Approved: { code: 2, text: "Orden Aprobada" },
  Processed: { code: 3, text: "Orden Procesada" },
  Paid: { code: 4, text: "Orden a Pagar" },
  Rejected: { code: 5, text: "Orden Rechazada" },
  Dispute: { code: 6, text: "Orden Observada" },

  //   Delivered: { code: 6, text: "Order Delivered" },
  //   Delivering: { code: 15, text: "Order being Delivered" },
  //   Backordered: { code: 7, text: "Order Backordered" },
  //   Resolve: { code: 9, text: "Order Dispute Resolved" },
  //   PayRequest: { code: 10, text: "Payment Requested" },
  //   Authorize: { code: 11, text: "Payment Approved" },
  //   Paid: { code: 14, text: "Payment Processed" },
  //   Refund: { code: 12, text: "Order Refund Requested" },
  //   Refunded: { code: 13, text: "Order Refunded" },
};

// Snarx Paperless contract
class SnarxPaperless extends Contract {
  // instantiate with keys to collect participant ids
  async instantiate(ctx) {
    let emptyList = [];
    await ctx.stub.putState("users", Buffer.from(JSON.stringify(emptyList)));
  }

  async VerificationUsers(ctx, mailId, companyName, password, rol) {
    // verify Provider
    let dataCompanies = await ctx.stub.getState(companyName);
    let company;
    if (dataCompanies) {
      company = JSON.parse(dataCompanies.toString());
      if (
        company.companyName !== companyName ||
        company.mailId !== mailId ||
        company.password !== password
      ) {
        throw new Error("Empresa/Usuario No Identificado en la Red");
      }
    } else {
      throw new Error("No se encontro a la Empresa");
    }

    return JSON.stringify(company);
  }

  // add a provider object to the blockchain state identifited by the providerId
  async Register(ctx, mailId, companyName, password, rol) {
    let register = {
      mailId: mailId,
      companyName: companyName,
      password: password,
      type: rol,
      orders: [],
    };
    await ctx.stub.putState(companyName, Buffer.from(JSON.stringify(register)));

    //add providerId to 'providers' key
    let data = await ctx.stub.getState("users");
    if (data) {
      let users = JSON.parse(data.toString());
      users.push(companyName);
      await ctx.stub.putState("users", Buffer.from(JSON.stringify(users)));
    } else {
      throw new Error("User not found");
    }

    // return provider object
    return JSON.stringify(register);
  }

  // add an order object to the blockchain state identifited by the orderNumber
  //   async CreateInnvoice(
  //     ctx,
  //     buyerId,
  //     sellerId,
  //     financeCoId,
  //     orderNumber,
  //     items,
  //     amount
  //   ) {
  //     // verify buyerId
  //     let buyerData = await ctx.stub.getState(buyerId);
  //     let buyer;
  //     if (buyerData) {
  //       buyer = JSON.parse(buyerData.toString());
  //       if (buyer.type !== "buyer") {
  //         throw new Error("buyer not identified");
  //       }
  //     } else {
  //       throw new Error("buyer not found");
  //     }

  //     // verify sellerId
  //     let sellerData = await ctx.stub.getState(sellerId);
  //     let seller;
  //     if (sellerData) {
  //       seller = JSON.parse(sellerData.toString());
  //       if (seller.type !== "seller") {
  //         throw new Error("seller not identified");
  //       }
  //     } else {
  //       throw new Error("seller not found");
  //     }

  //     // verify financeCoId
  //     let financeCoData = await ctx.stub.getState(financeCoId);
  //     let financeCo;
  //     if (financeCoData) {
  //       financeCo = JSON.parse(financeCoData.toString());
  //       if (financeCo.type !== "financeCo") {
  //         throw new Error("financeCo not identified");
  //       }
  //     } else {
  //       throw new Error("financeCo not found");
  //     }

  //     let order = {
  //       orderNumber: orderNumber,
  //       items: items,
  //       status: JSON.stringify(orderStatus.Created),
  //       dispute: null,
  //       resolve: null,
  //       backOrder: null,
  //       refund: null,
  //       amount: amount,
  //       buyerId: buyerId,
  //       sellerId: sellerId,
  //       shipperId: null,
  //       providerId: null,
  //       financeCoId: financeCoId,
  //     };

  //     //add order to buyer
  //     buyer.orders.push(orderNumber);
  //     await ctx.stub.putState(buyerId, Buffer.from(JSON.stringify(buyer)));

  //     //add order to financeCo
  //     financeCo.orders.push(orderNumber);
  //     await ctx.stub.putState(
  //       financeCoId,
  //       Buffer.from(JSON.stringify(financeCo))
  //     );

  //     //store order identified by orderNumber
  //     await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));

  //     // return financeCo object
  //     return JSON.stringify(order);
  //   }

  //   async Buy(ctx, orderNumber, buyerId, sellerId) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify buyerId
  //     let buyerData = await ctx.stub.getState(buyerId);
  //     let buyer;
  //     if (buyerData) {
  //       buyer = JSON.parse(buyerData.toString());
  //       if (buyer.type !== "buyer") {
  //         throw new Error("buyer not identified");
  //       }
  //     } else {
  //       throw new Error("buyer not found");
  //     }

  //     // verify sellerId
  //     let sellerData = await ctx.stub.getState(sellerId);
  //     let seller;
  //     if (sellerData) {
  //       seller = JSON.parse(sellerData.toString());
  //       if (seller.type !== "seller") {
  //         throw new Error("seller not identified");
  //       }
  //     } else {
  //       throw new Error("seller not found");
  //     }

  //     // update order status
  //     if (order.status === JSON.stringify(orderStatus.Created)) {
  //       order.status = JSON.stringify(orderStatus.Bought);
  //       await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));

  //       //add order to seller
  //       seller.orders.push(orderNumber);
  //       await ctx.stub.putState(sellerId, Buffer.from(JSON.stringify(seller)));

  //       return JSON.stringify(order);
  //     } else {
  //       throw new Error("order not created");
  //     }
  //   }

  //   async OrderCancel(ctx, orderNumber, sellerId, buyerId) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify buyerId
  //     let buyerData = await ctx.stub.getState(buyerId);
  //     let buyer;
  //     if (buyerData) {
  //       buyer = JSON.parse(buyerData.toString());
  //       if (buyer.type !== "buyer") {
  //         throw new Error("buyer not identified");
  //       }
  //     } else {
  //       throw new Error("buyer not found");
  //     }

  //     // verify sellerId
  //     let sellerData = await ctx.stub.getState(sellerId);
  //     let seller;
  //     if (sellerData) {
  //       seller = JSON.parse(sellerData.toString());
  //       if (seller.type !== "seller") {
  //         throw new Error("seller not identified");
  //       }
  //     } else {
  //       throw new Error("seller not found");
  //     }

  //     //update order
  //     if (
  //       order.status === JSON.stringify(orderStatus.Created) ||
  //       order.status === JSON.stringify(orderStatus.Bought) ||
  //       order.status === JSON.stringify(orderStatus.Backordered)
  //     ) {
  //       order.status = JSON.stringify(orderStatus.Cancelled);
  //       await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //       return JSON.stringify(order);
  //     } else {
  //       throw new Error("order not created, bought or backordered");
  //     }
  //   }

  //   async OrderFromSupplier(ctx, orderNumber, sellerId, providerId) {
  //     //get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     //verify sellerId
  //     let sellerData = await ctx.stub.getState(sellerId);
  //     let seller;
  //     if (sellerData) {
  //       seller = JSON.parse(sellerData.toString());
  //       if (seller.type !== "seller") {
  //         throw new Error("seller not identified");
  //       }
  //     } else {
  //       throw new Error("seller not found");
  //     }

  //     // verify providerId
  //     let providerData = await ctx.stub.getState(providerId);
  //     let provider;
  //     if (providerData) {
  //       provider = JSON.parse(providerData.toString());
  //       if (provider.type !== "provider") {
  //         throw new Error("provider not identified");
  //       }
  //     } else {
  //       throw new Error("provider not found");
  //     }

  //     //update order
  //     if (order.status === JSON.stringify(orderStatus.Bought)) {
  //       order.providerId = providerId;
  //       order.status = JSON.stringify(orderStatus.Ordered);
  //       await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));

  //       // add order to provider
  //       provider.orders.push(orderNumber);
  //       await ctx.stub.putState(
  //         providerId,
  //         Buffer.from(JSON.stringify(provider))
  //       );

  //       return JSON.stringify(order);
  //     } else {
  //       throw new Error("order status not bought");
  //     }
  //   }

  //   async RequestShipping(ctx, orderNumber, providerId, shipperId) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify providerId
  //     let providerData = await ctx.stub.getState(providerId);
  //     let provider;
  //     if (providerData) {
  //       provider = JSON.parse(providerData.toString());
  //       if (provider.type !== "provider") {
  //         throw new Error("provider not identified");
  //       }
  //     } else {
  //       throw new Error("provider not found");
  //     }

  //     // verify shipperId
  //     let shipperData = await ctx.stub.getState(shipperId);
  //     let shipper;
  //     if (shipperData) {
  //       shipper = JSON.parse(shipperData.toString());
  //       if (shipper.type !== "shipper") {
  //         throw new Error("shipper not identified");
  //       }
  //     } else {
  //       throw new Error("shipper not found");
  //     }

  //     // update order
  //     if (
  //       order.status === JSON.stringify(orderStatus.Ordered) ||
  //       order.status === JSON.stringify(orderStatus.Backordered)
  //     ) {
  //       order.shipperId = shipperId;
  //       order.status = JSON.stringify(orderStatus.ShipRequest);
  //       await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));

  //       // add order to shipper
  //       shipper.orders.push(orderNumber);
  //       await ctx.stub.putState(shipperId, Buffer.from(JSON.stringify(shipper)));

  //       return JSON.stringify(order);
  //     } else {
  //       throw new Error("order status not ordered or backordered");
  //     }
  //   }

  //   async Delivering(ctx, orderNumber, shipperId, deliveryStatus) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify shipperId
  //     let shipperData = await ctx.stub.getState(shipperId);
  //     let shipper;
  //     if (shipperData) {
  //       shipper = JSON.parse(shipperData.toString());
  //       if (shipper.type !== "shipper") {
  //         throw new Error("shipper not identified");
  //       }
  //     } else {
  //       throw new Error("shipper not found");
  //     }

  //     // update order
  //     if (
  //       order.status === JSON.stringify(orderStatus.ShipRequest) ||
  //       order.status.code === JSON.stringify(orderStatus.Delivering.code)
  //     ) {
  //       let _status = orderStatus.Delivering;
  //       _status.text += "  " + deliveryStatus;
  //       order.status = JSON.stringify(_status);

  //       await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //       return JSON.stringify(order);
  //     } else {
  //       throw new Error("order status not shipping requested or delivering");
  //     }
  //   }

  //   async Deliver(ctx, orderNumber, shipperId) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify shipperId
  //     let shipperData = await ctx.stub.getState(shipperId);
  //     let shipper;
  //     if (shipperData) {
  //       shipper = JSON.parse(shipperData.toString());
  //       if (shipper.type !== "shipper") {
  //         throw new Error("shipper not identified");
  //       }
  //     } else {
  //       throw new Error("shipper not found");
  //     }

  //     // update order
  //     if (
  //       order.status === JSON.stringify(orderStatus.ShipRequest) ||
  //       JSON.parse(order.status).code ===
  //         JSON.stringify(orderStatus.Delivering.code)
  //     ) {
  //       order.status = JSON.stringify(orderStatus.Delivered);
  //       await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //       return JSON.stringify(order);
  //     } else {
  //       throw new Error("order status not shipping requested or delivering");
  //     }
  //   }

  //   async RequestPayment(ctx, orderNumber, sellerId, financeCoId) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify sellerId
  //     let sellerData = await ctx.stub.getState(sellerId);
  //     let seller;
  //     if (sellerData) {
  //       seller = JSON.parse(sellerData.toString());
  //       if (seller.type !== "seller") {
  //         throw new Error("seller not identified");
  //       }
  //     } else {
  //       throw new Error("seller not found");
  //     }

  //     // verify financeCoId
  //     let financeCoData = await ctx.stub.getState(financeCoId);
  //     let financeCo;
  //     if (financeCoData) {
  //       financeCo = JSON.parse(financeCoData.toString());
  //       if (financeCo.type !== "financeCo") {
  //         throw new Error("financeCo not identified");
  //       }
  //     } else {
  //       throw new Error("financeCo not found");
  //     }

  //     // update order
  //     if (
  //       JSON.parse(order.status).text === orderStatus.Delivered.text ||
  //       JSON.parse(order.status).text === orderStatus.Resolve.text
  //     ) {
  //       order.status = JSON.stringify(orderStatus.PayRequest);

  //       await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //       return JSON.stringify(order);
  //     } else {
  //       throw new Error("order status not delivered or resolved");
  //     }
  //   }

  //   async AuthorizePayment(ctx, orderNumber, buyerId, financeCoId) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify buyerId
  //     let buyerData = await ctx.stub.getState(buyerId);
  //     let buyer;
  //     if (buyerData) {
  //       buyer = JSON.parse(buyerData.toString());
  //       if (buyer.type !== "buyer") {
  //         throw new Error("buyer not identified");
  //       }
  //     } else {
  //       throw new Error("buyer not found");
  //     }

  //     // verify financeCoId
  //     let financeCoData = await ctx.stub.getState(financeCoId);
  //     let financeCo;
  //     if (financeCoData) {
  //       financeCo = JSON.parse(financeCoData.toString());
  //       if (financeCo.type !== "financeCo") {
  //         throw new Error("financeCo not identified");
  //       }
  //     } else {
  //       throw new Error("financeCo not found");
  //     }

  //     //update order
  //     if (
  //       JSON.parse(order.status).text === orderStatus.PayRequest.text ||
  //       JSON.parse(order.status).text === orderStatus.Resolve.text
  //     ) {
  //       order.status = JSON.stringify(orderStatus.Authorize);

  //       await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //       return JSON.stringify(order);
  //     } else {
  //       throw new Error("order status not payment requested or resolved");
  //     }
  //   }

  //   async Pay(ctx, orderNumber, sellerId, financeCoId) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify sellerId
  //     let sellerData = await ctx.stub.getState(sellerId);
  //     let seller;
  //     if (sellerData) {
  //       seller = JSON.parse(sellerData.toString());
  //       if (seller.type !== "seller") {
  //         throw new Error("seller not identified");
  //       }
  //     } else {
  //       throw new Error("seller not found");
  //     }

  //     // verify financeCoId
  //     let financeCoData = await ctx.stub.getState(financeCoId);
  //     let financeCo;
  //     if (financeCoData) {
  //       financeCo = JSON.parse(financeCoData.toString());
  //       if (financeCo.type !== "financeCo") {
  //         throw new Error("financeCo not identified");
  //       }
  //     } else {
  //       throw new Error("financeCo not found");
  //     }

  //     // update order
  //     if (JSON.parse(order.status).text === orderStatus.Authorize.text) {
  //       order.status = JSON.stringify(orderStatus.Paid);

  //       await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //       return JSON.stringify(order);
  //     } else {
  //       throw new Error("order status not authorize payment");
  //     }
  //   }

  //   async Dispute(ctx, orderNumber, buyerId, sellerId, financeCoId, dispute) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify sellerId
  //     let sellerData = await ctx.stub.getState(sellerId);
  //     let seller;
  //     if (sellerData) {
  //       seller = JSON.parse(sellerData.toString());
  //       if (seller.type !== "seller") {
  //         throw new Error("seller not identified");
  //       }
  //     } else {
  //       throw new Error("seller not found");
  //     }

  //     // verify financeCoId
  //     let financeCoData = await ctx.stub.getState(financeCoId);
  //     let financeCo;
  //     if (financeCoData) {
  //       financeCo = JSON.parse(financeCoData.toString());
  //       if (financeCo.type !== "financeCo") {
  //         throw new Error("financeCo not identified");
  //       }
  //     } else {
  //       throw new Error("financeCo not found");
  //     }

  //     // verify buyerId
  //     let buyerData = await ctx.stub.getState(buyerId);
  //     let buyer;
  //     if (buyerData) {
  //       buyer = JSON.parse(buyerData.toString());
  //       if (buyer.type !== "buyer") {
  //         throw new Error("buyer not identified");
  //       }
  //     } else {
  //       throw new Error("buyer not found");
  //     }

  //     //update order
  //     order.status = JSON.stringify(orderStatus.Dispute);
  //     order.dispute = dispute;
  //     await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //     return JSON.stringify(order);
  //   }

  //   async Resolve(
  //     ctx,
  //     orderNumber,
  //     buyerId,
  //     sellerId,
  //     shipperId,
  //     providerId,
  //     financeCoId,
  //     resolve
  //   ) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify buyerId
  //     let buyerData = await ctx.stub.getState(buyerId);
  //     let buyer;
  //     if (buyerData) {
  //       buyer = JSON.parse(buyerData.toString());
  //       if (buyer.type !== "buyer") {
  //         throw new Error("buyer not identified");
  //       }
  //     } else {
  //       throw new Error("buyer not found");
  //     }

  //     // verify sellerId
  //     let sellerData = await ctx.stub.getState(sellerId);
  //     let seller;
  //     if (sellerData) {
  //       seller = JSON.parse(sellerData.toString());
  //       if (seller.type !== "seller") {
  //         throw new Error("seller not identified");
  //       }
  //     } else {
  //       throw new Error("seller not found");
  //     }

  //     // verify shipperId
  //     let shipperData = await ctx.stub.getState(shipperId);
  //     let shipper;
  //     if (shipperData) {
  //       shipper = JSON.parse(shipperData.toString());
  //       if (shipper.type !== "shipper") {
  //         throw new Error("shipper not identified");
  //       }
  //     } else {
  //       throw new Error("shipper not found");
  //     }

  //     // verify providerId
  //     let providerData = await ctx.stub.getState(providerId);
  //     let provider;
  //     if (providerData) {
  //       provider = JSON.parse(providerData.toString());
  //       if (provider.type !== "provider") {
  //         throw new Error("provider not identified");
  //       }
  //     } else {
  //       throw new Error("provider not found");
  //     }

  //     // verify financeCoId
  //     let financeCoData = await ctx.stub.getState(financeCoId);
  //     let financeCo;
  //     if (financeCoData) {
  //       financeCo = JSON.parse(financeCoData.toString());
  //       if (financeCo.type !== "financeCo") {
  //         throw new Error("financeCo not identified");
  //       }
  //     } else {
  //       throw new Error("financeCo not found");
  //     }

  //     // update order
  //     order.status = JSON.stringify(orderStatus.Resolve);
  //     order.resolve = resolve;
  //     await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //     return JSON.stringify(order);
  //   }

  //   async Refund(ctx, orderNumber, sellerId, financeCoId, refund) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify sellerId
  //     let sellerData = await ctx.stub.getState(sellerId);
  //     let seller;
  //     if (sellerData) {
  //       seller = JSON.parse(sellerData.toString());
  //       if (seller.type !== "seller") {
  //         throw new Error("seller not identified");
  //       }
  //     } else {
  //       throw new Error("seller not found");
  //     }

  //     // verify financeCoId
  //     let financeCoData = await ctx.stub.getState(financeCoId);
  //     let financeCo;
  //     if (financeCoData) {
  //       financeCo = JSON.parse(financeCoData.toString());
  //       if (financeCo.type !== "financeCo") {
  //         throw new Error("financeCo not identified");
  //       }
  //     } else {
  //       throw new Error("financeCo not found");
  //     }

  //     order.status = JSON.stringify(orderStatus.Refund);
  //     order.refund = refund;

  //     await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //     return JSON.stringify(order);
  //   }

  //   async BackOrder(ctx, orderNumber, providerId, backorder) {
  //     // get order json
  //     let data = await ctx.stub.getState(orderNumber);
  //     let order;
  //     if (data) {
  //       order = JSON.parse(data.toString());
  //     } else {
  //       throw new Error("order not found");
  //     }

  //     // verify providerId
  //     let providerData = await ctx.stub.getState(providerId);
  //     let provider = JSON.parse(providerData.toString());
  //     if (provider.type !== "provider" || order.providerId !== providerId) {
  //       throw new Error("provider not identified");
  //     }

  //     // update order
  //     order.status = JSON.stringify(orderStatus.Backordered);
  //     order.backOrder = backorder;
  //     await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
  //     return JSON.stringify(order);
  //   }

  // get the state from key
  async GetState(ctx, key) {
    let data = await ctx.stub.getState(key);
    let jsonData = JSON.parse(data.toString());
    return JSON.stringify(jsonData);
  }
}

module.exports = SnarxPaperless;
