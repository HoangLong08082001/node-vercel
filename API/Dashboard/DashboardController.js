const pool = require("../../config/database");

const getTotalStatis = (req, res) => {
  const queryThisWeek = `
        SELECT (SUM(commission.direct_commission)+SUM(commission.indirect_commission)) AS total_revenue_this_week
        FROM commission
        WHERE YEARWEEK(commission.create_at, 1) = YEARWEEK(CURDATE(), 1);
    `;

  const queryLastWeek = `
        SELECT (SUM(commission.direct_commission)+SUM(commission.indirect_commission)) AS total_revenue_last_week
        FROM commission
        WHERE YEARWEEK(commission.create_at, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1);
    `;
  const withdrawThisWeek =
    "SELECT SUM(withdraw.amount_transferred) as total_transferred FROM withdraw WHERE withdraw.status_transferred=1 AND YEARWEEK(withdraw.date_transferred, 1) = YEARWEEK(CURDATE(), 1)";
  const withdrawLastWeek =
    "SELECT SUM(withdraw.amount_transferred) as total_transferred FROM withdraw WHERE withdraw.status_transferred=1 AND YEARWEEK(withdraw.date_transferred, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1);";
  const taxRateThisWeek =
    "SELECT SUM(tax.tax_rate) as total_tax FROM tax WHERE YEARWEEK(tax.created_on, 1) = YEARWEEK(CURDATE(), 1) ";
  const taxRateLastWeek =
    "SELECT SUM(tax.tax_rate) as total_tax FROM tax WHERE YEARWEEK(tax.created_on, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1);";
  pool.query(queryThisWeek, (err, resultThisWeek) => {
    if (err) throw err;

    pool.query(queryLastWeek, (err, resultLastWeek) => {
      if (err) throw err;

      const total_commission_this_week =
        resultThisWeek[0].total_revenue_this_week || 0;
      const total_commission_last_week =
        resultLastWeek[0].total_revenue_last_week || 0;
      let percentage_change = null;
      let change_sign = "";

      if (total_commission_last_week !== 0) {
        percentage_change =
          ((total_commission_this_week - total_commission_last_week) /
            total_commission_last_week) *
          100;
        change_sign = percentage_change >= 0 ? "+" : "-";
      }
      pool.query(withdrawThisWeek, (err, resultWithdrawThisWeek) => {
        if (err) throw err;
        pool.query(withdrawLastWeek, (err, resultWithdrawLastWeek) => {
          if (err) throw err;
          const total_withdraw_this_week =
            resultWithdrawThisWeek[0].total_transferred || 0;
          const total_withdraw_last_week =
            resultWithdrawLastWeek[0].total_transferred || 0;
          let percentage_change_withdraw = null;
          let change_sign_withdraw = "";
          if (total_withdraw_last_week !== 0) {
            percentage_change_withdraw =
              ((total_withdraw_this_week - total_withdraw_last_week) /
                total_withdraw_last_week) *
              100;
            change_sign_withdraw = percentage_change_withdraw >= 0 ? "+" : "-";
          }
          pool.query(taxRateThisWeek, (err, resultTaxThisWeek) => {
            if (err) throw err;
            pool.query(taxRateLastWeek, (err, resultTaxLasWeek) => {
              if (err) throw err;
              const total_tax_this_week = resultTaxThisWeek[0].total_tax || 0;
              const total_tax_last_week = resultTaxLasWeek[0].total_tax || 0;
              let percentage_chance_tax = null;
              let change_sign_tax = "";
              if (total_tax_last_week !== 0) {
                percentage_chance_tax =
                  ((total_tax_this_week - total_tax_last_week) /
                    total_tax_last_week) *
                  100;
                change_sign_tax = percentage_chance_tax >= 0 ? "+" : "-";
              }
              const data = {
                total_commission_this_week,
                total_commission_last_week,
                percentage_change:
                  percentage_change !== null
                    ? `${change_sign}${Math.abs(percentage_change).toFixed(2)}`
                    : +100,
              };
              const data2 = {
                total_withdraw_this_week,
                total_withdraw_last_week,
                percentage_change_withdraw:
                  percentage_change_withdraw !== null
                    ? `${change_sign_withdraw}${Math.abs(
                        percentage_change_withdraw
                      ).toFixed(2)}`
                    : +100,
              };
              const data3 = {
                total_tax_this_week,
                total_tax_last_week,
                percentage_chance_tax:
                  percentage_chance_tax !== null
                    ? `${change_sign_tax}${Math.abs(
                        percentage_chance_tax
                      ).toFixed(2)}`
                    : +100,
              };
              res.json({
                tong_hoa_hong: data,
                tong_tien_da_chuyen: data2,
                tong_thue_da_nhan: data3,
              });
            });
          });
        });
      });
    });
  });
};

const getTotalArea = (req, res) => {
  const total_collaborator_by_date =
    "SELECT MONTH(collaborator.date_create) AS month, (SELECT COUNT(collaborator.id_collaborator) FROM collaborator) as all_collaborator, COUNT(collaborator.id_collaborator) AS total_collaborator FROM collaborator GROUP BY DATE_FORMAT(collaborator.date_create, '%Y-%m') ORDER BY DATE_FORMAT(collaborator.date_create, '%Y-%m');";
  const total_orders_by_date =
    "SELECT MONTH(withdraw.date_transferred) AS month, (SELECT COUNT(withdraw.id_withdraw) FROM withdraw WHERE withdraw.type_transferred=0) as all_commission_orders, COUNT(withdraw.id_withdraw) AS total_orders FROM withdraw WHERE type_transferred=0 GROUP BY DATE_FORMAT(withdraw.date_transferred, '%Y-%m') ORDER BY DATE_FORMAT(withdraw.date_transferred, '%Y-%m');";
  pool.query(total_collaborator_by_date, (err, resultCollaboratorTotal) => {
    if (err) throw err;
    pool.query(total_orders_by_date, (err, resultTotalOrder) => {
      let all_collaborator = resultCollaboratorTotal[0].all_collaborator;
      if (err) throw err;
      if (resultCollaboratorTotal.length > 0 && resultTotalOrder.length > 0) {
        let all_order = resultTotalOrder[0].all_commission_orders || 0;

        return res.status(200).json({
          total_collaborator: {
            all_collaborator: all_collaborator,
            resultCollaboratorTotal,
          },
          total_orders_success: {
            all_commission_orders: all_order,
            resultTotalOrder,
          },
        });
      } else {
        return res.status(200).json({
          total_collaborator: {
            all_collaborator: all_collaborator,
            resultCollaboratorTotal,
          },
          total_orders_success: {
            all_commission_orders: 0,
            resultTotalOrder,
          },
        });
      }
    });
  });
};

const getTotalBar = (req, res) => {
  const total_collaborator_by_date =
    "SELECT MONTH(withdraw.date_transferred) AS month, SUM(withdraw.amount_recived) AS total_commission, (SELECT COUNT(collaborator.id_collaborator) FROM collaborator GROUP BY DATE_FORMAT(collaborator.date_create, '%Y-%m') ORDER BY DATE_FORMAT(collaborator.date_create, '%Y-%m')) as total_collaborator FROM withdraw WHERE type_transferred=0 GROUP BY DATE_FORMAT(withdraw.date_transferred, '%Y-%m') ORDER BY DATE_FORMAT(withdraw.date_transferred, '%Y-%m');";
  pool.query(total_collaborator_by_date, (err, resultCollaboratorTotal) => {
    if (err) throw err;
    if (resultCollaboratorTotal) {
      return res.status(200).json(resultCollaboratorTotal);
    }
  });
};

const getTotalByIdCollaborator = (req, res) => {
  let id = req.params.id;
  const queryThisWeek = `
        SELECT (SUM(commission.direct_commission)+SUM(commission.indirect_commission)) AS total_revenue_this_week
        FROM commission join collaborator on commission.id_collaborator = collaborator.id_collaborator
        WHERE YEARWEEK(commission.create_at, 1) = YEARWEEK(CURDATE(), 1) AND collaborator.phone=?;
    `;

  const queryLastWeek = `
        SELECT (SUM(commission.direct_commission)+SUM(commission.indirect_commission)) AS total_revenue_last_week
        FROM commission join collaborator on commission.id_collaborator = collaborator.id_collaborator
        WHERE YEARWEEK(commission.create_at, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND collaborator.phone=?;
    `;
  const withdrawThisWeek =
    "SELECT SUM(withdraw.amount_transferred) as total_transferred FROM withdraw join collaborator on withdraw.id_collaborator = collaborator.id_collaborator WHERE withdraw.status_transferred=1 AND YEARWEEK(withdraw.date_transferred, 1) = YEARWEEK(CURDATE(), 1) AND collaborator.phone = ?;";
  const withdrawLastWeek =
    "SELECT SUM(withdraw.amount_transferred) as total_transferred FROM withdraw join collaborator on withdraw.id_collaborator = collaborator.id_collaborator WHERE withdraw.status_transferred=1 AND YEARWEEK(withdraw.date_transferred, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND collaborator.phone = ?;";
  const taxRateThisWeek =
    "SELECT SUM(tax.tax_rate) as total_tax FROM tax join collaborator on tax.id_collaborator = collaborator.id_collaborator WHERE YEARWEEK(tax.created_on, 1) = YEARWEEK(CURDATE(), 1) AND collaborator.phone = ?;";
  const taxRateLastWeek =
    "SELECT SUM(tax.tax_rate) as total_tax FROM tax join collaborator on tax.id_collaborator = collaborator.id_collaborator WHERE YEARWEEK(tax.created_on, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND collaborator.phone = ?;";
  pool.query(queryThisWeek, [id], (err, resultThisWeek) => {
    if (err) throw err;

    pool.query(queryLastWeek, [id], (err, resultLastWeek) => {
      if (err) throw err;

      const total_commission_this_week =
        resultThisWeek[0].total_revenue_this_week || 0;
      const total_commission_last_week =
        resultLastWeek[0].total_revenue_last_week || 0;
      let percentage_change = null;
      let change_sign = "";

      if (total_commission_last_week !== 0) {
        percentage_change =
          ((total_commission_this_week - total_commission_last_week) /
            total_commission_last_week) *
          100;
        change_sign = percentage_change >= 0 ? "+" : "-";
      }
      pool.query(withdrawThisWeek, [id], (err, resultWithdrawThisWeek) => {
        if (err) throw err;
        pool.query(withdrawLastWeek, [id], (err, resultWithdrawLastWeek) => {
          if (err) throw err;
          const total_withdraw_this_week =
            resultWithdrawThisWeek[0].total_transferred || 0;
          const total_withdraw_last_week =
            resultWithdrawLastWeek[0].total_transferred || 0;
          let percentage_change_withdraw = null;
          let change_sign_withdraw = "";
          if (total_withdraw_last_week !== 0) {
            percentage_change_withdraw =
              ((total_withdraw_this_week - total_withdraw_last_week) /
                total_withdraw_last_week) *
              100;
            change_sign_withdraw = percentage_change_withdraw >= 0 ? "+" : "-";
          }
          pool.query(taxRateThisWeek, [id], (err, resultTaxThisWeek) => {
            if (err) throw err;
            pool.query(taxRateLastWeek, [id], (err, resultTaxLasWeek) => {
              if (err) throw err;
              const total_tax_this_week = resultTaxThisWeek[0].total_tax || 0;
              const total_tax_last_week = resultTaxLasWeek[0].total_tax || 0;
              let percentage_chance_tax = null;
              let change_sign_tax = "";
              if (total_tax_last_week !== 0) {
                percentage_chance_tax =
                  ((total_tax_this_week - total_tax_last_week) /
                    total_tax_last_week) *
                  100;
                change_sign_tax = percentage_chance_tax >= 0 ? "+" : "-";
              }
              const data = {
                total_commission_this_week,
                total_commission_last_week,
                percentage_change:
                  percentage_change !== null
                    ? `${change_sign}${Math.abs(percentage_change).toFixed(2)}`
                    : null,
              };
              const data2 = {
                total_withdraw_this_week,
                total_withdraw_last_week,
                percentage_change_withdraw:
                  percentage_change_withdraw !== null
                    ? `${change_sign_withdraw}${Math.abs(
                        percentage_change_withdraw
                      ).toFixed(2)}`
                    : null,
              };
              const data3 = {
                total_tax_this_week,
                total_tax_last_week,
                percentage_chance_tax:
                  percentage_chance_tax !== null
                    ? `${change_sign_tax}${Math.abs(
                        percentage_chance_tax
                      ).toFixed(2)}`
                    : null,
              };
              res.json({
                tong_hoa_hong: data,
                tong_tien_da_chuyen: data2,
                tong_thue_da_nhan: data3,
              });
            });
          });
        });
      });
    });
  });
};

const getTotalAreaByIdCollaborator = (req, res) => {
  let id = req.params.id;
  pool.query(
    "SELECT * FROM collaborator WHERE collaborator.phone = ?",
    [id],
    (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        let phone = data[0].phone;
        pool.query(
          "SELECT MONTH(Team.time_create) as month,(SELECT COUNT(collaborator.id_collaborator) FROM collaborator WHERE collaborator.presenter_phone = ?) as all_collaborator , COUNT(collaborator.id_collaborator) as total_collaborator FROM collaborator join team_collaborator on collaborator.id_collaborator = team_collaborator.id_collaborator join Team on team_collaborator.id_team = Team.id_team WHERE collaborator.presenter_phone = ? GROUP BY DATE_FORMAT(Team.time_create, '%Y-%m') ORDER BY DATE_FORMAT(Team.time_create, '%Y-%m');",
          [phone, phone],
          (err, resultCollaboratorTotal) => {
            if (err) {
              throw err;
            }
            pool.query(
              "SELECT MONTH(withdraw.date_transferred) AS month, (SELECT COUNT(withdraw.id_withdraw) FROM withdraw join collaborator on withdraw.id_collaborator = collaborator.id_collaborator WHERE withdraw.type_transferred=0 AND collaborator.phone = ?) as all_commission_orders, COUNT(withdraw.id_withdraw) AS total_orders FROM withdraw join collaborator on withdraw.id_collaborator = collaborator.id_collaborator WHERE type_transferred=0 AND collaborator.phone = ? GROUP BY DATE_FORMAT(withdraw.date_transferred, '%Y-%m') ORDER BY DATE_FORMAT(withdraw.date_transferred, '%Y-%m');",
              [id, id],
              (err, resultTotalOrder) => {
                let all_collaborator =
                  resultCollaboratorTotal[0].all_collaborator;
                if (err) {
                  throw err;
                }
                if (
                  resultCollaboratorTotal.length > 0 &&
                  resultTotalOrder.length > 0
                ) {
                  let all_order =
                    resultTotalOrder[0].all_commission_orders || 0;
                  return res.status(200).json({
                    total_collaborator: {
                      all_collaborator: all_collaborator,
                      resultCollaboratorTotal,
                    },
                    total_orders_success: {
                      all_commission_orders: all_order,
                      resultTotalOrder,
                    },
                  });
                } else {
                  return res.status(200).json({
                    total_collaborator: {
                      all_collaborator: all_collaborator,
                      resultCollaboratorTotal,
                    },
                    total_orders_success: {
                      all_commission_orders: 0,
                      resultTotalOrder,
                    },
                  });
                }
              }
            );
          }
        );
      } else {
        return res.status(200).json([]);
      }
    }
  );
};

const getTotalBarByIdCollaborator = (req, res) => {
  let id = req.params.id;
  pool.query(
    "SELECT * FROM collaborator WHERE collaborator.phone = ?",
    [id],
    (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        let phone = data[0].phone;
        pool.query(
          "SELECT MONTH(Team.time_create) as month,(SELECT SUM(withdraw.amount_recived) FROM collaborator join team_collaborator on collaborator.id_collaborator = team_collaborator.id_collaborator join Team on team_collaborator.id_team = Team.id_team join withdraw on collaborator.id_collaborator = withdraw.id_collaborator WHERE collaborator.presenter_phone = ? AND withdraw.type_transferred = 0) as total_commission , COUNT(collaborator.id_collaborator) as total_collaborator FROM collaborator join team_collaborator on collaborator.id_collaborator = team_collaborator.id_collaborator join Team on team_collaborator.id_team = Team.id_team WHERE collaborator.presenter_phone = ? GROUP BY DATE_FORMAT(Team.time_create, '%Y-%m') ORDER BY DATE_FORMAT(Team.time_create, '%Y-%m');",
          [phone, phone],
          (err, resultBarChart) => {
            if (err) {
              throw err;
            }
            if (resultBarChart) {
              return res.status(200).json(resultBarChart);
            }
          }
        );
      }
    }
  );
};

module.exports = {
  getTotalStatis,
  getTotalArea,
  getTotalBar,
  getTotalByIdCollaborator,
  getTotalAreaByIdCollaborator,
  getTotalBarByIdCollaborator,
};
