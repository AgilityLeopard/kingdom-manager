import React, { useEffect, useState } from 'react';
import { HexGrid, Layout, GridGenerator, Hex, HexUtils } from 'react-hexgrid';
import "./HexagonalGrid.scss";
import map from '../database/map_no_label.jpg';
import { MapHexData, MapHexagon } from './MapHex';
import EditHexDataDialog from './HexEdit';
import { HexplorationState } from '../map/HexplorationState';
import { TerrainFeature } from '../map/TerrainFeature';
import { TerrainType } from '../map/TerrainType';

const HexagonalGrid: React.FC = () => {
  const hexagonLayout = GridGenerator.rectangle(29, 12);
  const hexagonSize = 11.0445;

  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
  const [selectedHex, setSelectedHex] = useState<Hex | null>(null);
  const [hexData, setHexData] = useState<Record<string, MapHexData>>({});

  const handleHexClick = (event: React.MouseEvent<SVGElement, MouseEvent>, hex: Hex) => {
    const clickedHex = event.target as SVGElement;
    console.log(hex);
    setDialogPosition(clickedHex.getBoundingClientRect());
    setSelectedHex(hex);
  };

  const handleDialogClose = () => {
    setSelectedHex(null);
  };

  const handleSave = (data: MapHexData) => {
    setHexData((prevData) => ({
      ...prevData,
      [selectedHex!.q + ',' + selectedHex!.r]: data
    }));
    setSelectedHex(null);
  };

  const hexToHexData = (hex: Hex): MapHexData => {
    return hexData[hex.q + ',' + hex.r] ?? defaultHex;
  }

  useEffect(() => {
    if (Object.keys(hexData).length === 0) {
      setHexData(JSON.parse(localStorage.getItem("hexMapData") || "{}"))
    }
  }, []);

  useEffect(() => {
    if (Object.keys(hexData).length !== 0) {
      localStorage.setItem("hexMapData", JSON.stringify(hexData, null, 4))
    }
  }, [hexData]);

  const defaultHex = {
    level: 20,
    safe: false,
    state: HexplorationState.Unexplored,
    feature: TerrainFeature.None,
    roads: "",
    terrainType: TerrainType.Aquatic,
    hidden: false,
    reference: ""
  }

  return (
    <div className='map-container'>
      <img src={map} alt="Kingdom Map" className='kingdom-image' />
      <HexGrid viewBox='179.73 -12.2 200 200' className='kingdom-map'>
        <Layout
          size={{ x: hexagonSize, y: hexagonSize }}
          flat={false}
          spacing={1.01}>
          {hexagonLayout.map((hex, index) => {
            const data = hexToHexData(hex);

            return <MapHexagon
              key={index}
              q={hex.q}
              r={hex.r}
              s={hex.s}
              hexData={data}
              onClick={(event) => handleHexClick(event, hex)}
            />
          })}
        </Layout>
      </HexGrid>
      {selectedHex && (
        <EditHexDataDialog
          open={true}
          style={{
            top: dialogPosition.top + 10 * hexagonSize,
            left: dialogPosition.left + 10 * hexagonSize
          }}
          hexData={hexData[selectedHex.q + ',' + selectedHex.r] ?? defaultHex}
          onClose={handleDialogClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default HexagonalGrid;
