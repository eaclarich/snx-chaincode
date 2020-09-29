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
    let dataUser = await ctx.stub.getState(mailId);
    let user;
    if (dataUser) {
      user = JSON.parse(dataUser.toString());
      if (
        // user.companyName !== companyName ||
        user.mailId !== mailId ||
        user.password !== password
      ) {
        throw new Error("Usuario No Identificado en la Red");
      }
    } else {
      throw new Error("No se encontro al Usuario ", mailId);
    }

    return JSON.stringify(user);
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
    await ctx.stub.putState(mailId, Buffer.from(JSON.stringify(register)));

    //add providerId to 'providers' key
    let data = await ctx.stub.getState("users");
    if (data) {
      let users = JSON.parse(data.toString());
      users.push(mailId);
      await ctx.stub.putState("users", Buffer.from(JSON.stringify(users)));
    } else {
      throw new Error("User not found");
    }

    // return provider object
    return JSON.stringify(register);
  }

  // add an order object to the blockchain state identifited by the orderNumber
  async CreateOrder(
    ctx,
    orderNumber,
    provider,
    client,
    country,
    doc_file,
    doc_type,
    doc_Id,
    tax_code,
    tax_auth,
    doc_date,
    total_amount
  ) {
    // verify provider
    let providerData = await ctx.stub.getState(provider);
    let providerItem;
    if (providerData) {
      providerItem = JSON.parse(providerData.toString());
      if (providerItem.mailId !== provider) {
        throw new Error("Provider not identified");
      }
    } else {
      throw new Error("Provider not found");
    }

    // verify client
    let clientData = await ctx.stub.getState(client);
    let clientItem;
    if (clientData) {
      clientItem = JSON.parse(clientData.toString());
      if (clientItem.mailId !== client) {
        throw new Error("Client not identified");
      }
    } else {
      throw new Error("Client not found");
    }

    let order = {
      orderNumber: orderNumber,
      status: JSON.stringify(orderStatus.Received),
      provider: provider,
      client: client,
      country: country,
      doc_file: doc_file,
      doc_type: doc_type,
      doc_Id: doc_Id,
      tax_code: tax_code,
      tax_auth: tax_auth,
      doc_date: doc_date,
      total_amount: total_amount,
    };

    //add order to Provider
    providerItem.orders.push(orderNumber);
    await ctx.stub.putState(
      provider,
      Buffer.from(JSON.stringify(providerItem))
    );

    //add order to Client
    clientItem.orders.push(orderNumber);
    await ctx.stub.putState(client, Buffer.from(JSON.stringify(clientItem)));

    //store order identified by orderNumber
    await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));

    // return financeCo object
    return JSON.stringify(order);
  }

  // get the state from key
  async GetState(ctx, key) {
    let data = await ctx.stub.getState(key);
    let jsonData = JSON.parse(data.toString());
    return JSON.stringify(jsonData);
  }
}

module.exports = SnarxPaperless;
