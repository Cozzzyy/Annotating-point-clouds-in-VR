import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {useBoxContext} from "../../context/BoxContext";

const options = [
    'Export labels to Segments.ai',
    'Delete sample',
];

const ITEM_HEIGHT = 48;

interface LongMenuProps {
    datasetId: string;
    handleDeleteDataset: (datasetId: string) => void;
}

export default function LongMenu( {datasetId, handleDeleteDataset}: LongMenuProps) {
    const {exportBoxes} = useBoxContext();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                sx={{ml: -2, mr: -1}}
            >
                <MoreVertIcon/>
            </IconButton>
            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: '32ch',
                        },
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option}
                        onClick={() => {
                            handleClose();
                            if (option === 'Export labels to Segments.ai') {
                                exportBoxes(datasetId);
                            } else {
                                handleDeleteDataset(datasetId);
                            }
                        }}
                        sx={{
                            color: option === 'Delete sample' ? 'error.main' : 'text.primary',
                        }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
