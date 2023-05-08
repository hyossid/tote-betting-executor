CREATE OR REPLACE VIEW "horse_racing_data"."my_bet_result" AS 
 SELECT eb.race_number,
    eb.horse AS my_bet_horse,
    eb.amount AS my_bet_amount,
    rr.horse AS win_horse,
    rr.dividens,
        CASE
            WHEN ((eb.horse)::text = (rr.horse)::text) THEN (eb.amount * rr.dividens)
            ELSE (0)::numeric
        END AS result_amount,
        CASE
            WHEN ((eb.horse)::text = (rr.horse)::text) THEN 'WIN'
            ELSE 'LOSE'
        END AS result
   FROM (horse_racing_data.executed_bet eb
     LEFT JOIN horse_racing_data.race_result rr ON ((eb.race_number = rr.race_number)));
