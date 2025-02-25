import { query, DBErrorException } from "./index.js";
import { formatNumberPadding, formatToReadableDate } from "../utils/index.js";
import { INVENTORY_STATUS } from "../Routes/constants.js";

export const getBarcodesFromContainers = async () => {
  try {
    return await query(
      `SELECT container_id, barcode FROM containers WHERE deleted_at IS NULL;`
    );
  } catch (error) {
    throw new DBErrorException("getBarcodesFromContainers", error);
  }
};

export const getContainer = async (container_id) => {
  try {
    const [container] = await query(
      `
          SELECT
            c.container_id,
            c.barcode,
            JSON_OBJECT(
              'supplier_id', s.supplier_id,
              'name', s.name,
              'code', s.supplier_code
            ) AS supplier,
            SUM(CASE WHEN i.status = "${INVENTORY_STATUS.SOLD}" THEN ai.price END) AS total_sold_item_price,
            COUNT(CASE WHEN i.status = "${INVENTORY_STATUS.SOLD}" THEN 1 END) AS sold_items,
            c.container_num,
            c.bill_of_lading_number,
            c.port_of_landing,
            c.carrier,
            c.vessel,
            c.num_of_items,
            c.departure_date_from_japan,
            c.eta_to_ph,
            c.arrival_date_warehouse_ph,
            c.sorting_date,
            c.auction_date,
            c.payment_date,
            c.telegraphic_transferred,
            c.vanning_date,
            c.devanning_date,
            c.invoice_num,
            c.gross_weight,
            c.auction_or_sell,
            c.created_at,
            c.updated_at
          FROM containers c
          LEFT JOIN suppliers s ON s.supplier_id = c.supplier_id
          LEFT JOIN branches b ON b.branch_id = c.branch_id
          LEFT JOIN inventories i ON i.container_id = c.container_id
          LEFT JOIN auctions_inventories ai ON ai.inventory_id = i.inventory_id
          WHERE c.container_id = ?;
        `,
      [container_id]
    );
    return container;
  } catch (error) {
    throw new DBErrorException("getContainer", error);
  }
};

export const getContainers = async () => {
  try {
    return await query(`
        SELECT
          c.*,
          s.name
        FROM containers c
        LEFT JOIN suppliers s on s.supplier_id = c.supplier_id
        WHERE c.deleted_at IS NULL
      `);
  } catch (error) {
    throw new DBErrorException("getContainers", error);
  }
};

export const getContainersBySupplier = async (supplier_id) => {
  try {
    return await query(
      `
        SELECT
          c.container_id,
          c.barcode,
          c.container_num,
          c.num_of_items,
          JSON_OBJECT(
            'branch_id', b.branch_id,
            'name', b.name
          ) AS branch
        FROM containers c
        LEFT JOIN branches b ON b.branch_id = c.branch_id
        WHERE supplier_id = ?
        AND c.deleted_at IS NULL;
      `,
      [supplier_id]
    );
  } catch (error) {
    throw new DBErrorException("getContainersBySupplier", error);
  }
};

export const createContainer = async (supplier_id, container) => {
  try {
    const [{ supplier_code, supplier_name }] = await query(
      `
        SELECT
          supplier_code,
          name AS supplier_name
        FROM suppliers
        WHERE supplier_id = ?
      `,
      [supplier_id]
    );

    const result = await query(
      `
        INSERT INTO containers(
          supplier_id,
          barcode,
          container_num,
          departure_date_from_japan,
          bill_of_lading_number,
          port_of_landing,
          eta_to_ph,
          carrier,
          arrival_date_warehouse_ph,
          sorting_date,
          auction_date,
          payment_date,
          telegraphic_transferred,
          vessel,
          invoice_num,
          gross_weight,
          vanning_date,
          devanning_date,
          auction_or_sell,
          branch_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        supplier_id,
        `${supplier_code}-${formatNumberPadding(container.container_num, 3)}`,
        container.container_num,
        container.departure_date_from_japan,
        container.bill_of_lading_number,
        container.port_of_landing,
        container.eta_to_ph,
        container.carrier,
        container.arrival_date_warehouse_ph,
        container.sorting_date,
        container.auction_date,
        container.payment_date,
        container.telegraphic_transferred,
        container.vessel,
        container.invoice_num,
        container.gross_weight,
        container.vanning_date,
        container.devanning_date,
        container.auction_or_sell,
        container.branch_id,
      ]
    );

    // NOTE: GET BACK TO THIS
    // DILEMMA: IF EITHER WE SHOULD ADD CUSTOM "num_of_containers" OR RESET IT TO 0
    await query(
      `UPDATE suppliers SET num_of_containers = num_of_containers +1 WHERE supplier_id = ?`,
      [supplier_id]
    );

    const [{ name: branch_name }] = await query(
      `SELECT name FROM branches WHERE branch_id = ?`,
      [container.branch_id]
    );

    const newContainer = formatToReadableDate(container);

    if (result.insertId) {
      const { branch_id, ...rest } = newContainer;
      return {
        container_id: result.insertId,
        num_of_items: 0,
        supplier: {
          id: supplier_id,
          name: supplier_name,
          code: supplier_code,
        },
        branch: {
          id: container.branch_id,
          name: branch_name,
        },
        ...rest,
        barcode: `${supplier_code}-${formatNumberPadding(
          container.container_num
        )}`,
      };
    }
  } catch (error) {
    throw new DBErrorException("createContainer", error);
  }
};

export const updateContainer = async (id, container) => {
  try {
    const result = await query(
      `
        UPDATE containers
        SET ?
        WHERE container_id = ? AND deleted_at IS NULL;
        `,
      [container, id]
    );
    const updatedContainer = await query(
      `SELECT * FROM containers c WHERE container_id = ?`,
      [id]
    );

    if (result.affectedRows) {
      return updatedContainer[0];
    }
  } catch (error) {
    throw new DBErrorException("updateContainer", error);
  }
};

export const deleteContainer = async (id) => {
  try {
    const result = await query(
      `
          UPDATE containers
          SET deleted_at = NOW()
          WHERE container_id = ? AND deleted_at IS NULL;
        `,
      [id]
    );

    if (result.affectedRows) {
      return { container_id: id };
    }
  } catch (error) {
    throw new DBErrorException("deleteContainer", error);
  }
};
