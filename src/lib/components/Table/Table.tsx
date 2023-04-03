import React from "react";
import { TableStyle, Text, TableHeader, TableRowHeader, TableRowBody, TableCell, } from "./Table.styled";

export type TableProps = { 
    tableHeader: {
        label: string,
        key: string,
        alignment?: string,
    }[],
    tableRows: {
        cells: { 
            key: string,
            component: React.ReactNode,
            alignment?: string,
            id?: string,
        }[]  
    }[]
}

const Table = (
    {tableRows, tableHeader}: TableProps
    ) => (
    <TableStyle>
        <TableRowHeader length={tableHeader.length}>
            {tableHeader.map(({label, key, alignment}, index) => (
                <TableHeader key={`header-${key}-${index}`} alignment={alignment}>
                    <Text>{label}</Text>
                </TableHeader>
            ))}
        </TableRowHeader>
        {tableRows.map(({cells}, indexRow) => (
            <TableRowBody length={tableHeader.length} key={`row-${indexRow}`}> 
                {cells.map(({component, id, key, alignment}, indexCell) => {
                    const keyMap = id || `cell-${key}-${indexRow}-${indexCell}`
                    return(
                        <TableCell key={keyMap} alignment={alignment}>
                            {component}
                        </TableCell>
                    )}
                )}
            </TableRowBody>
        ))}
    </TableStyle>
)

export default Table;