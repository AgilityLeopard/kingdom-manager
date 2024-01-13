import { Chip, Drawer, Paper, Slider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useMemo, useState } from "react";
import { Army } from "../../features/warfare/Army";
import { ArmyEdit } from "./ArmyEdit";
import "./Warfare.css";
import { Condition } from "../../features/warfare/conditions/Condition";
import { ConditionType, createCondition } from "../../features/warfare/conditions/ConditionTypes";
import { CreateArmy } from "./CreateArmy";
import { addArmy, getArmies, updateArmy } from "../../features/firestore/WarfareDao";
import { AddArmyCondition } from "./AddArmyCondition";

const columns = ["Name", "Health", "Conditions"];

interface WarfareProps {
    mapId: string;
    level: number;
    gmView: boolean;
    armies: Array<Army>;
    setArmies: React.Dispatch<React.SetStateAction<Array<Army>>>;
}

const Warfare: React.FC<WarfareProps> = ({ mapId, level, gmView, armies, setArmies }) => {
    const [previewArmy, setPreviewArmy] = useState<Army>();
    const [conditionReceiverArmy, setConditionReceiverArmy] = useState<Army>();

    const unsubscribe = useMemo(() => {
        if (armies.length === 0) {
            return getArmies(mapId, level, setArmies);
        }
    }, [mapId]);

    const addCondition = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, army: Army) => {
        e.preventDefault();
        e.stopPropagation();

        setConditionReceiverArmy(army);
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

        editArmy(army);
    };

    const decreaseCondition = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, army: Army, condition: Condition): void => {
        e.preventDefault();
        let result = condition.decreaseValue();
        if (result === undefined || result === 0) {
            army.removeCondition(condition);
        }

        editArmy(army);
    };

    const editArmy = (army: Army) => {
        updateArmy(army).then(() => {
            setArmies(armies.map(oldArmy => {
                if (oldArmy.name === army.name) {
                    return army;
                }
                return oldArmy;
            }));
        });
    };

    const saveArmy = (army: Army) => {
        army.mapId = mapId;
        addArmy(army).then(id => {
            army.id = id;
            setArmies([...armies, army]);
        });
    };

    const updateHp = (e: Event, newValue: number, army: Army) => {
        e.preventDefault();
        e.stopPropagation();

        army.currentHp = newValue;

        editArmy(army);
    };

    const onCloseArmyEdit = () => {
        editArmy(previewArmy as Army);
        setPreviewArmy(undefined);
    };

    useEffect(() => {
        if (gmView && unsubscribe && armies.length > 0) {
            unsubscribe();
        }
    }, [armies]);

    return <div>
        <Paper sx={{ overflow: "hidden" }}>
            <CreateArmy level={level} saveArmy={saveArmy} />
            {conditionReceiverArmy && <AddArmyCondition army={conditionReceiverArmy} updateArmy={editArmy} onClose={() => setConditionReceiverArmy(undefined)} />}
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
                                <TableRow hover tabIndex={-1} key={index} sx={{ bgcolor: !gmView ? undefined : army.ally ? "darkolivegreen" : "brown" }}>
                                    <TableCell sx={{ cursor: "pointer" }} onClick={_ => setPreviewArmy(army)}>{army.name}</TableCell>
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
                                                    key={condition.name}
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
            {previewArmy && <ArmyEdit army={previewArmy} updateArmy={editArmy} gmView={gmView} />}
        </Drawer>
    </div>;
};

export { Warfare };
