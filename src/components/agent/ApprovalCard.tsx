import React, { useState } from 'react';
import { ShieldAlert, Check, X, Edit3, AlertTriangle } from 'lucide-react';
import type { ApprovalRequest } from '../../types/agent';

interface ApprovalCardProps {
  request: ApprovalRequest;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({ request }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [argsJson, setArgsJson] = useState(() => JSON.stringify(request.args, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);

  const handleApprove = () => {
    if (isEditing) {
      try {
        const parsed = JSON.parse(argsJson);
        request.resolve({ approved: true, modifiedArgs: parsed });
      } catch (err) {
        setParseError('Invalid JSON format. Please verify arguments syntax.');
      }
    } else {
      request.resolve({ approved: true });
    }
  };

  const handleReject = () => {
    request.resolve({ approved: false });
  };

  const isSensitive = request.permission === 'sensitive';

  return (
    <div className="my-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 card-shadow transition-all duration-200 animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isSensitive ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-900">
              Human-in-the-Loop Authorization Required
            </div>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span>Execute</span>
              <code className="px-1.5 py-0.5 rounded-md bg-white border border-amber-200 text-xs font-mono text-amber-950 font-semibold">
                {request.toolName}
              </code>
            </div>
          </div>
        </div>

        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
          isSensitive
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {isSensitive ? 'Sensitive Action' : 'Write Mutation'}
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-3">
        The agent requested permission to run an external write action. You can inspect the payload, edit parameters, or decline this step.
      </p>

      {/* Arguments Inspection / Edit Box */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium text-slate-700">Action Arguments</span>
          <button
            type="button"
            onClick={() => {
              setIsEditing(!isEditing);
              setParseError(null);
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit arguments'}</span>
          </button>
        </div>

        {isEditing ? (
          <div>
            <textarea
              rows={4}
              value={argsJson}
              onChange={(e) => {
                setArgsJson(e.target.value);
                setParseError(null);
              }}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
            />
            {parseError && (
              <div className="flex items-center gap-1 text-[11px] text-rose-600 mt-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        ) : (
          <pre className="p-2.5 rounded-xl bg-white/90 border border-amber-200/80 text-[11px] font-mono text-slate-700 overflow-x-auto max-h-36">
            {JSON.stringify(request.args, null, 2)}
          </pre>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={handleReject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
          <span>Reject action</span>
        </button>
        <button
          onClick={handleApprove}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B5B] to-[#FFB547] hover:brightness-105 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 text-white" />
          <span>{isEditing ? 'Save & Approve' : 'Approve Execution'}</span>
        </button>
      </div>
    </div>
  );
};
