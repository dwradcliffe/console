/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Button } from 'libs/ui/lib/button/Button'
import { EmptyMessage } from 'libs/ui/lib/empty-message/EmptyMessage'
import { useMemo, useState } from 'react'

import {
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type VpcFirewallRule,
} from '@oxide/api'
import {
  ButtonCell,
  createColumnHelper,
  DateCell,
  EnabledCell,
  FirewallFilterCell,
  getActionsCol,
  Table,
  TypeValueListCell,
  useReactTable,
} from '@oxide/table'
import { TableEmptyBox } from '@oxide/ui'
import { sortBy, titleCase } from '@oxide/util'

import { CreateFirewallRuleForm } from 'app/forms/firewall-rules-create'
import { EditFirewallRuleForm } from 'app/forms/firewall-rules-edit'
import { useVpcSelector } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'

const colHelper = createColumnHelper<VpcFirewallRule>()

/** columns that don't depend on anything in `render` */
const staticColumns = [
  colHelper.accessor('priority', {
    header: 'Priority',
    cell: (info) => <div className="text-secondary">{info.getValue()}</div>,
  }),
  colHelper.accessor('action', {
    header: 'Action',
    cell: (info) => <div className="text-secondary">{titleCase(info.getValue())}</div>,
  }),
  colHelper.accessor('direction', {
    header: 'Direction',
    cell: (info) => <div className="text-secondary">{titleCase(info.getValue())}</div>,
  }),
  colHelper.accessor('targets', {
    header: 'Targets',
    cell: (info) => <TypeValueListCell value={info.getValue()} />,
  }),
  colHelper.accessor('filters', {
    header: 'Filters',
    cell: (info) => <FirewallFilterCell value={info.getValue()} />,
  }),
  colHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <EnabledCell value={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', {
    id: 'created',
    header: 'Created',
    cell: (info) => <DateCell value={info.getValue()} />,
  }),
]

export const VpcFirewallRulesTab = () => {
  const queryClient = useApiQueryClient()
  const vpcSelector = useVpcSelector()

  const { data } = usePrefetchedApiQuery('vpcFirewallRulesView', {
    query: vpcSelector,
  })
  const rules = useMemo(() => sortBy(data.rules, (r) => r.priority), [data])

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcFirewallRule | null>(null)

  const updateRules = useApiMutation('vpcFirewallRulesUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcFirewallRulesView')
    },
  })

  // the whole thing can't be static because the action depends on setEditing
  const columns = useMemo(() => {
    return [
      colHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <ButtonCell onClick={() => setEditing(info.row.original)}>
            {info.getValue()}
          </ButtonCell>
        ),
      }),
      ...staticColumns,
      getActionsCol((rule: VpcFirewallRule) => [
        { label: 'Edit', onActivate: () => setEditing(rule) },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              updateRules.mutateAsync({
                query: vpcSelector,
                body: {
                  rules: rules.filter((r) => r.id !== rule.id),
                },
              }),
            label: rule.name,
          }),
        },
      ]),
    ]
  }, [setEditing, rules, updateRules, vpcSelector])

  const table = useReactTable({ columns, data: rules })

  const emptyState = (
    <TableEmptyBox>
      <EmptyMessage
        title="No firewall rules"
        body="You need to create a rule to be able to see it here"
        buttonText="New rule"
        onClick={() => setCreateModalOpen(true)}
      />
    </TableEmptyBox>
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Button size="sm" onClick={() => setCreateModalOpen(true)}>
          New rule
        </Button>
        {createModalOpen && (
          <CreateFirewallRuleForm
            existingRules={rules}
            onDismiss={() => setCreateModalOpen(false)}
          />
        )}
        {editing && (
          <EditFirewallRuleForm
            existingRules={rules}
            originalRule={editing}
            onDismiss={() => setEditing(null)}
          />
        )}
      </div>
      {rules.length > 0 ? <Table table={table} /> : emptyState}
    </>
  )
}
