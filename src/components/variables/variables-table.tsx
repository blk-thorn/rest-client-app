"use rest";

import React from "react";
import { Button } from "../../lib/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../lib/ui/table";
import { Trash } from "lucide-react";
import { useVariablesStore } from "@/lib/stores/variables";
import { useTranslations } from "next-intl";

export type Variable = {
  [name: string]: string;
};

function VariablesTable() {
  const t = useTranslations("Variables");

  const { variables, deleteVariable } = useVariablesStore();

  return variables.length > 0 ? (
    <div className="w-full border border-gray-700 rounded-lg bg-gray-800 p-5">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="border-b-gray-500 pointer-events-none">
            <TableHead className="text-[16px] text-gray-500 text-center p-4">
              {t("table.name")}
            </TableHead>
            <TableHead className="text-[16px] text-gray-500 text-center p-4">
              {t("table.value")}
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variables.map((item) => (
            <TableRow
              key={Object.keys(item)[0]}
              className="p-5 hover:bg-gray-700 border-b-gray-500"
            >
              <TableCell className="p-5">{Object.keys(item)}</TableCell>
              <TableCell className="p-5">{Object.values(item)}</TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => deleteVariable(Object.keys(item)[0])}>
                  <Trash />
                  {t("table.delete")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ) : (
    <div className="w-full border-2 border-dashed border-gray-600 rounded-lg bg-gray-800 p-8 text-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <p className="text-gray-400 text-lg">{t("no-variables-message")}</p>
        <p className="text-gray-500 text-sm">{t("no-variables-hint")}</p>
      </div>
    </div>
  );
}

export default VariablesTable;
