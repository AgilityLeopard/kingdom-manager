import { Button, Chip, Drawer, Paper, Slider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import { Army } from "../../features/warfare/Army";
import { ArmyType } from "../../features/warfare/ArmyType";
import { Outflanked } from "../../features/warfare/conditions/Outflanked";
import { ArmyEdit } from "./ArmyEdit";
import { Mired } from "../../features/warfare/conditions/Mired";
import { Pinned } from "../../features/warfare/conditions/Pinned";
import "./Warfare.css";
import { Condition } from "../../features/warfare/conditions/Condition";
import { ConditionType, createCondition } from "../../features/warfare/conditions/ConditionTypes";

const columns = ["Name", "Health", "Conditions"];

const Warfare: React.FC = () => {
    const [previewArmy, setPreviewArmy] = useState<number | undefined>(undefined);
    const [armies, setArmies] = useState<Army[]>([new Army({
        armyType: ArmyType.Infantry,
        currentHp: 0,
        highManeuver: false,
        name: "BOYZZZ",
        level: 1,
        conditions: [new Outflanked(), new Mired(), new Pinned()]
    })]);

    const addCondition = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, army: Army) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const increaseCondition = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, army: Army, condition: Condition): void => {
        e.preventDefault();
        e.stopPropagation();
        let result = condition.increaseValue();
        if (result === undefined) {
            return;
        }

        if (result === 4) {
            if (condition.name === "Mired" && !army.hasCondition("Pinned")) {
                army.addCondition(createCondition(ConditionType.Pinned));
            }
            if (condition.name === "Shaken" && !army.hasCondition("Routed")) {
                army.addCondition(createCondition(ConditionType.Routed));
            }
        }

        saveArmy(army);
    };

    const decreaseCondition = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, army: Army, condition: Condition): void => {
        e.preventDefault();
        let result = condition.decreaseValue();
        if (result === undefined || result === 0) {
            army.removeCondition(condition);
        }

        saveArmy(army);
    };

    const saveArmy = (army: Army) => {
        setArmies(armies.map(oldArmy => {
            if (oldArmy.name === army.name) {
                return army;
            }
            return oldArmy;
        }));
    };

    const updateHp = (e: Event, newValue: number, army: Army) => {
        e.preventDefault();
        e.stopPropagation();

        army.currentHp = newValue;

        saveArmy(army);
    };

    const onCloseArmyEdit = () => {
        saveArmy(armies[previewArmy as number]);
        setPreviewArmy(undefined);
    };

    return <div>
        <Paper sx={{ overflow: "hidden" }}>
            <Button>New Army</Button>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column}>
                                    {column}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {armies.map((army, index) => {
                            return (
                                <TableRow hover tabIndex={-1} key={index}>
                                    <TableCell sx={{ cursor: "pointer" }} onClick={_ => setPreviewArmy(index)}>{army.name}</TableCell>
                                    <TableCell width={"150px"}>
                                        <Slider sx={{ marginTop: "15px" }} step={1} min={0} max={army.hp} value={army.currentHp} onChange={(e, newValue) => updateHp(e, newValue as number, army)}
                                            marks={[
                                                {
                                                    value: 0,
                                                    label: 0
                                                },
                                                {
                                                    value: army.routThreshold,
                                                    label: `${army.routThreshold} (RT)`
                                                },
                                                {
                                                    value: army.hp,
                                                    label: army.hp
                                                }
                                            ]} valueLabelDisplay="on" />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction={"row"} spacing={1}>
                                            <Chip
                                                sx={{ "& .MuiChip-icon": { marginRight: "-20px" } }}
                                                icon={<AddIcon />}
                                                variant="outlined"
                                                onClick={e => addCondition(e, army)}
                                            />
                                            {army.conditions.map(condition => (
                                                <Chip
                                                    label={`${condition.name} ${condition.value ?? ""}`}
                                                    onClick={(e) => increaseCondition(e, army, condition)}
                                                    onDelete={(e) => decreaseCondition(e, army, condition)}
                                                />
                                            ))}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
        <Drawer anchor="right" open={previewArmy !== undefined} onClose={_ => onCloseArmyEdit()}>
            <ArmyEdit army={armies[previewArmy ?? 0]} />
        </Drawer>
    </div>;
};

export { Warfare };